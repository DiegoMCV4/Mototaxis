import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import socketService from '../services/socket';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import ChatModal from '../components/ChatModal';

const { width, height } = Dimensions.get('window');

export default function DriverDashboard({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState(null);
  
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [currentRide, setCurrentRide] = useState(null);
  const [ridePhase, setRidePhase] = useState(null); 
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const isChatVisibleRef = useRef(false);

  const locationSubscription = useRef(null);
  const mapRef = useRef(null);
  
  const isOnlineRef = useRef(isOnline);
  const currentRideRef = useRef(currentRide);

  const DRIVER_ID = user?.id || 'driver-demo';

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    currentRideRef.current = currentRide;
  }, [currentRide]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la ubicación para usar el mapa.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
    })();

    // SOCKET PERSISTENTE
    const socket = socketService.connect();

    socket.on('rideCancelled', (data) => {
      if (data.rideId === currentRideRef.current?.rideId) {
        Alert.alert('Viaje cancelado', 'El pasajero ha cancelado el viaje.');
        handleCancellationReset();
      }
    });

    socket.on('newMessage', (data) => {
      if (data.rideId === currentRideRef.current?.rideId) {
        setMessages((prev) => [...prev, data]);
        
        if (data.senderId !== DRIVER_ID) {
          if (!isChatVisibleRef.current) {
            setUnreadCount(prev => prev + 1);
            setToastMessage(data.message || data.text);
            setTimeout(() => setToastMessage(null), 3000);
          }
        }
      }
    });

    return () => {
      stopTracking();
      socket.off('rideCancelled');
      socket.off('newMessage');
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [isOnline]);

  const startTracking = async () => {
    try {
      const socket = socketService.getSocket() || socketService.connect();

      // Limpiar listener anterior si existe
      socket.off('newRideRequest');

      socket.on('newRideRequest', (data) => {
        if (isOnlineRef.current && !currentRideRef.current) {
          setIncomingRequest(data);
        }
      });

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));

          socket.emit('driverLocation', {
            driverId: DRIVER_ID,
            latitude,
            longitude,
            rideId: currentRideRef.current?.rideId || null,
          });
        }
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el rastreo.');
      setIsOnline(false);
    }
  };

  const handleCancellationReset = () => {
    setCurrentRide(null);
    setRidePhase(null);
    setIsOnline(true);
    setUnreadCount(0);
    setMessages([]);
    setToastMessage(null);
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    const socket = socketService.getSocket();
    if (socket) {
      socket.off('newRideRequest');
      socket.emit('goOffline', { driverId: DRIVER_ID });
      // NO desconectar el socket aquí para permitir chat y cancelaciones durante el viaje
    }
    setIncomingRequest(null);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Desconectarse",
      "¿Deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: async () => {
          stopTracking();
          socketService.disconnect(); // Aquí sí desconectamos
          await logout();
        }}
      ]
    );
  };

  const onSendMessage = (text) => {
    const socket = socketService.getSocket();
    if (socket) {
      const msgData = {
        rideId: currentRideRef.current?.rideId,
        senderId: DRIVER_ID,
        text,
        timestamp: new Date().toISOString()
      };
      socket.emit('message', msgData);
    }
  };

  const toggleOnline = () => {
    if (currentRide) {
      Alert.alert('En viaje', 'Termina tu viaje actual antes de desconectarte.');
      return;
    }
    setIsOnline(!isOnline);
  };

  const cancelRide = () => {
    Alert.alert(
      "Cancelar viaje",
      "¿Estás seguro que deseas cancelar el viaje?",
      [
        { text: "No", style: "cancel" },
        { text: "Sí, cancelar", style: "destructive", onPress: () => {
          const socket = socketService.getSocket();
          if (socket) {
             console.log(`🚫 DRIVER emite rideCancelled para ${currentRide.rideId}`);
            socket.emit('rideCancelled', {
              rideId: currentRide.rideId,
              cancelledBy: 'driver',
              userId: user?.id
            });
           } else {
             console.error('❌ Socket no disponible para cancelar');
          }
          handleCancellationReset();
        }}
      ]
    );
  };

  const handleSOS = () => {
    Alert.alert(
      "S.O.S. Emergencia",
      "¿Deseas enviar una alerta de emergencia?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "ENVIAR ALERTA", style: "destructive", onPress: () => {
          const socket = socketService.getSocket();
          if (socket) {
            socket.emit('emergencyCall', {
              rideId: currentRide?.rideId,
              userId: user?.id,
              location,
              timestamp: new Date()
            });
          }
          Alert.alert("Alerta Enviada", "Se ha activado el protocolo de emergencia.");
        }}
      ]
    );
  };

  const acceptRide = () => {
    if (!incomingRequest) return;
    const socket = socketService.getSocket();
    if (socket) {
       console.log(`✅ DRIVER emite rideAccepted para ${incomingRequest.rideId}`);
      socket.emit('rideAccepted', {
        rideId: incomingRequest.rideId,
        driverId: DRIVER_ID,
        passengerId: incomingRequest.passengerId,
      });
       console.log(`✅ DRIVER emite joinRide para ${incomingRequest.rideId}`);
      socket.emit('joinRide', incomingRequest.rideId);
      setCurrentRide(incomingRequest);
      setRidePhase('accepted');
      setIncomingRequest(null);
      setIsOnline(false); 
     } else {
       console.error('❌ Socket no disponible para aceptar viaje');
      
      if (location && incomingRequest) {
        mapRef.current?.fitToCoordinates([location, incomingRequest], {
          edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
          animated: true,
        });
      }
    }
  };

  const rejectRide = () => {
    setIncomingRequest(null);
  };

  const startRide = () => {
    const socket = socketService.getSocket();
    if (socket && currentRide) {
      socket.emit('rideStarted', {
        rideId: currentRide.rideId,
        driverId: DRIVER_ID,
        passengerId: currentRide.passengerId,
      });
      setRidePhase('in_progress');
      
      if (currentRide.destination && location) {
        mapRef.current?.fitToCoordinates([location, currentRide.destination], {
          edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
          animated: true,
        });
      }
    }
  };

  const completeRide = () => {
    const socket = socketService.getSocket();
    if (socket && currentRide) {
      socket.emit('rideCompleted', {
        rideId: currentRide.rideId,
        driverId: DRIVER_ID,
        passengerId: currentRide.passengerId,
      });
      setCurrentRide(null);
      setRidePhase(null);
      setIsChatVisible(false);
      setIsOnline(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* MAPA FULLSCREEN */}
      {location ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={location}
          showsUserLocation={false}
          showsMyLocationButton={false}
          userInterfaceStyle={theme.mapStyle}
        >
          {/* Driver Marker */}
          <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} anchor={{x: 0.5, y: 0.5}}>
            <Text style={{fontSize: 32}}>🏍️</Text>
          </Marker>
          
          {/* Incoming Request Marker */}
          {incomingRequest && (
            <Marker coordinate={{ latitude: incomingRequest.latitude, longitude: incomingRequest.longitude }}>
              <View style={styles.passengerMarker}>
                <View style={[styles.passengerMarkerInner, { borderColor: isDarkMode ? theme.card : 'white' }]} />
              </View>
            </Marker>
          )}
          
          {/* Current Ride Passenger Location */}
          {currentRide && (
            <Marker coordinate={{ latitude: currentRide.latitude, longitude: currentRide.longitude }}>
              <View style={styles.passengerMarker}>
                <View style={[styles.passengerMarkerInner, { borderColor: isDarkMode ? theme.card : 'white' }]} />
              </View>
            </Marker>
          )}

          {/* Current Ride Destination */}
          {currentRide && currentRide.destination && (
            <Marker coordinate={{ latitude: currentRide.destination.latitude, longitude: currentRide.destination.longitude }}>
              <View style={[styles.passengerMarker, { backgroundColor: 'rgba(17, 24, 39, 0.2)' }]}>
                <View style={[styles.passengerMarkerInner, { backgroundColor: theme.text, borderColor: isDarkMode ? theme.card : 'white' }]} />
              </View>
            </Marker>
          )}

          {/* Route to Destination */}
          {currentRide && currentRide.destination && (
            <Polyline
              coordinates={[
                { latitude: currentRide.latitude, longitude: currentRide.longitude },
                { latitude: currentRide.destination.latitude, longitude: currentRide.destination.longitude }
              ]}
              strokeColor={theme.text}
              strokeWidth={3}
            />
          )}
        </MapView>
      ) : (
        <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* TOP BAR / EARNINGS */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={[styles.menuBtn, { backgroundColor: theme.card }]} onPress={handleLogout}>
          <Text style={[styles.menuIcon, { color: theme.text }]}>☰</Text>
        </TouchableOpacity>
        
        <View style={[styles.earningsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.earningsLabel, { color: theme.textMuted }]}>Hoy</Text>
          <Text style={[styles.earningsAmount, { color: theme.text }]}>$1,250.00</Text>
        </View>

        <TouchableOpacity style={[styles.menuBtn, { backgroundColor: theme.card }]} onPress={toggleTheme}>
          <Text style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* OVERLAY OFFLINE (Blur simulation) */}
      {!isOnline && !currentRide && !incomingRequest && (
        <View style={[styles.offlineOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }]} pointerEvents="none" />
      )}

      {/* BOTTOM AREA */}
      <View style={styles.bottomArea}>
        
        {/* OFFLINE / ONLINE CIRCULAR BUTTON */}
        {!currentRide && !incomingRequest && (
          <View style={styles.goButtonContainer}>
            {!isOnline && <Text style={[styles.offlineStatusText, { backgroundColor: theme.card, color: theme.text }]}>Estás desconectado</Text>}
            <TouchableOpacity 
              style={[styles.goButton, isOnline ? styles.goButtonOnline : [styles.goButtonOffline, { backgroundColor: theme.primary }]]} 
              onPress={toggleOnline}
            >
              <Text style={[styles.goButtonText, isOnline && {color: theme.danger}]}>
                {isOnline ? 'PARAR' : 'GO'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* INCOMING REQUEST MODAL (BOTTOM SHEET) */}
        {incomingRequest && (
          <View style={[styles.incomingCard, { backgroundColor: theme.card, shadowColor: isDarkMode ? '#000' : '#888' }]}>
            <View style={styles.incomingHeader}>
              <Text style={{fontSize: 48, marginBottom: 8}}>📍</Text>
              <Text style={[styles.incomingPrice, { color: theme.text }]}>${incomingRequest.estimatedPrice}</Text>
              <Text style={[styles.incomingDesc, { color: theme.textMuted }]}>2 min • 1.5 km de distancia</Text>
            </View>
            <View style={styles.incomingActions}>
              <TouchableOpacity style={[styles.rejectBtn, { backgroundColor: theme.bg }]} onPress={rejectRide}>
                <Text style={[styles.rejectBtnText, { color: theme.text }]}>Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: theme.primary }]} onPress={acceptRide}>
                <Text style={styles.acceptBtnText}>Aceptar Viaje</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ACTIVE RIDE CONTROLS */}
        {currentRide && (
          <View style={[styles.activeRideCard, { backgroundColor: theme.card, shadowColor: isDarkMode ? '#000' : '#888' }]}>
            <View style={styles.rideInfoRow}>
              <View>
                <Text style={[styles.ridePassengerName, { color: theme.text }]}>Pasajero: {currentRide?.passengerId?.split('-')[0]}</Text>
                <Text style={[styles.rideEarning, { color: theme.textMuted }]}>Ganancia: ${currentRide.estimatedPrice}</Text>
              </View>
              <TouchableOpacity style={[styles.chatIconBtn, { backgroundColor: theme.bg }]} onPress={() => {
                setIsChatVisible(true);
                isChatVisibleRef.current = true;
                setUnreadCount(0);
              }}>
                <Text style={{fontSize: 20}}>💬</Text>
                {unreadCount > 0 && <View style={styles.inlineBadge}><Text style={styles.inlineBadgeText}>{unreadCount}</Text></View>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtnSmall, { backgroundColor: theme.danger + '20' }]} onPress={cancelRide}>
                <Text style={{color: theme.danger, fontWeight: '700'}}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            {ridePhase === 'accepted' && (
              <TouchableOpacity style={[styles.actionMainBtn, {backgroundColor: theme.text}]} onPress={startRide}>
                <Text style={styles.actionMainBtnText}>Iniciar Viaje</Text>
              </TouchableOpacity>
            )}

            {ridePhase === 'in_progress' && (
              <TouchableOpacity style={[styles.actionMainBtn, {backgroundColor: theme.danger}]} onPress={completeRide}>
                <Text style={styles.actionMainBtnText}>Completar Viaje</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      </View>

      <ChatModal 
        isVisible={isChatVisible} 
        onClose={() => {
          setIsChatVisible(false);
          isChatVisibleRef.current = false;
          setUnreadCount(0);
        }} 
        messages={messages}
        onSendMessage={onSendMessage}
        currentUserId={DRIVER_ID}
      />

      {toastMessage && !isChatVisible && (
        <View style={[styles.toast, { backgroundColor: theme.card, borderColor: theme.primary }]}>
          <Text style={{fontSize: 20, marginRight: 10}}>💬</Text>
          <View style={{flex: 1}}>
            <Text style={[styles.toastTitle, { color: theme.primary }]}>Nuevo mensaje</Text>
            <Text style={[styles.toastText, { color: theme.text }]} numberOfLines={1}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {currentRide && (
        <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
          <Text style={styles.sosText}>S.O.S</Text>
        </TouchableOpacity>
      )}

      {unreadCount > 0 && !isChatVisible && (
        <TouchableOpacity 
          style={[styles.unreadBadge, { backgroundColor: theme.primary }]}
          onPress={() => {
            setIsChatVisible(true);
            isChatVisibleRef.current = true;
            setUnreadCount(0);
          }}
        >
          <Text style={styles.unreadText}>💬 {unreadCount} nuevo mensaje</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  menuIcon: {
    fontSize: 20,
  },
  earningsCard: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: '900',
  },
  offlineOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  goButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  offlineStatusText: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  goButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 4,
    borderColor: 'white',
  },
  goButtonOffline: {
  },
  goButtonOnline: {
    borderWidth: 3,
  },
  goButtonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 24,
    letterSpacing: 1,
  },
  incomingCard: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  incomingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  incomingPrice: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  incomingDesc: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  incomingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectBtn: {
    flex: 0.35,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
  acceptBtn: {
    flex: 0.6,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
  activeRideCard: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  rideInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ridePassengerName: {
    fontSize: 20,
    fontWeight: '800',
  },
  rideEarning: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  chatIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMainBtn: {
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionMainBtnText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
  cancelBtnSmall: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosBtn: {
    position: 'absolute',
    top: 150,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'white',
  },
  sosText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
  },
  unreadBadge: {
    position: 'absolute',
    bottom: 250,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  unreadText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 14,
  },
  inlineBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1000,
  },
  toastTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
  }
});
