import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import socketService from '../services/socket';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import ChatModal from '../components/ChatModal';

const { width, height } = Dimensions.get('window');

export default function PassengerDashboard({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  const [location, setLocation] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [destination, setDestination] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [isChatVisible, setIsChatVisible] = useState(false);
  
  const [rideState, setRideState] = useState('idle'); 
  const [driverInfo, setDriverInfo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [rating, setRating] = useState(5);
  const currentRideIdRef = useRef(null);
  const isChatVisibleRef = useRef(false);

  const mapRef = useRef(null);

  useEffect(() => {
    let locationSubscription;

    const setupLocationAndSocket = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la ubicación para buscar conductores.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });

      const socket = socketService.connect();
      
      socket.on('driversUpdate', (drivers) => {
        setNearbyDrivers(drivers);
      });

      socket.on('rideAccepted', (data) => {
        if (data.rideId === currentRideIdRef.current) {
          setRideState('accepted');
          setDriverInfo(data);
        }
      });

      socket.on('rideStarted', (data) => {
        if (data.rideId === currentRideIdRef.current) {
          setRideState('in_progress');
        }
      });

      socket.on('rideCompleted', (data) => {
        if (data.rideId === currentRideIdRef.current) {
          setRideState('completed');
        }
      });

      socket.on('rideCancelled', (data) => {
        if (data.rideId === currentRideIdRef.current) {
          Alert.alert('Viaje cancelado', 'El viaje ha sido cancelado.');
          resetRide();
        }
      });

      socket.on('newMessage', (data) => {
        if (data.rideId === currentRideIdRef.current) {
          setMessages((prev) => [...prev, data]);
          
          if (data.senderId !== user?.id) {
            if (!isChatVisibleRef.current) {
              setUnreadCount(prev => prev + 1);
              setToastMessage(data.message || data.text);
              // Hide toast after 3 seconds
              setTimeout(() => setToastMessage(null), 3000);
            }
          }
        }
      });

      locationSubscription = await Location.watchPositionAsync(
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
        }
      );
    };

    setupLocationAndSocket();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      const socket = socketService.getSocket();
      if (socket) {
        socket.off('driversUpdate');
        socket.off('rideAccepted');
        socket.off('rideStarted');
        socket.off('rideCompleted');
        socket.off('rideCancelled');
        socket.off('newMessage');
      }
    };
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: async () => {
          socketService.disconnect();
          await logout();
        }}
      ]
    );
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
            socket.emit('rideCancelled', {
              rideId: currentRideIdRef.current,
              cancelledBy: 'passenger',
              userId: user?.id
            });
          }
          resetRide();
        }}
      ]
    );
  };

  const handleSOS = () => {
    Alert.alert(
      "S.O.S. Emergencia",
      "¿Deseas enviar una alerta de emergencia a las autoridades y a tus contactos?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "ENVIAR ALERTA", style: "destructive", onPress: () => {
          const socket = socketService.getSocket();
          if (socket) {
            socket.emit('emergencyCall', {
              rideId: currentRideIdRef.current,
              userId: user?.id,
              location,
              timestamp: new Date()
            });
          }
          Alert.alert("Alerta Enviada", "Las autoridades han sido notificadas y el rastreo GPS está activo.");
        }}
      ]
    );
  };

  const onSendMessage = (text) => {
    const socket = socketService.getSocket();
    if (socket && currentRideIdRef.current) {
      const msgData = {
        rideId: currentRideIdRef.current,
        senderId: user?.id || 'passenger-demo',
        text,
        timestamp: new Date().toISOString()
      };
      console.log('📤 PASSENGER emite message:', JSON.stringify(msgData));
      socket.emit('message', msgData);
    } else {
      console.error('❌ No hay socket o rideId para enviar mensaje');
      Alert.alert('Error', 'No se pudo enviar el mensaje. Intenta de nuevo.');
    }
  };

  const requestRide = () => {
    if (!location || !destination) {
      Alert.alert('Atención', 'Por favor selecciona un destino tocando el mapa.');
      return;
    }
    const rideId = `ride-${Date.now()}`;
    currentRideIdRef.current = rideId;
    
    const socket = socketService.getSocket();
    if (socket) {
      setRideState('searching');
       console.log(`📍 PASSENGER emite joinRide con ${rideId}`);
      socket.emit('joinRide', rideId);
       console.log(`📍 PASSENGER emite newRideRequest`);
      socket.emit('newRideRequest', {
        rideId,
        passengerId: user?.id || socket.id || 'passenger-demo',
        latitude: location.latitude,
        longitude: location.longitude,
        destination,
        estimatedPrice,
      });
     } else {
       console.error('❌ Socket no disponible');
       Alert.alert('Error', 'No se pudo conectar al servidor.');
    }
  };

  const cancelSearch = () => {
    setRideState('idle');
    currentRideIdRef.current = null;
  };

  const calculatePrice = (start, end) => {
    const R = 6371; 
    const dLat = (end.latitude - start.latitude) * Math.PI / 180;
    const dLon = (end.longitude - start.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(start.latitude * Math.PI / 180) * Math.cos(end.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; 
    return Math.max(20, Math.round(15 + (d * 8)));
  };

  const handleMapPress = (e) => {
    if (rideState !== 'idle') return;
    const dest = e.nativeEvent.coordinate;
    setDestination(dest);
    if (location) {
      setEstimatedPrice(calculatePrice(location, dest));
    }
  };

  const submitRating = () => {
    // Aquí se podría llamar a apiClient.post('/ratings', ...)
    Alert.alert("¡Gracias!", "Tu calificación ha sido enviada con éxito.");
    resetRide();
  };

  const resetRide = () => {
    setRideState('idle');
    setDestination(null);
    setEstimatedPrice(0);
    setDriverInfo(null);
    setUnreadCount(0);
    setMessages([]);
    setToastMessage(null);
    setRating(5);
    currentRideIdRef.current = null;
    setIsChatVisible(false);
    isChatVisibleRef.current = false;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* REAL MAP BACKGROUND (LocationIQ) */}
      <View style={styles.simulatedMap}>
        {location ? (
          <Image 
            source={{ uri: `https://maps.locationiq.com/v3/staticmap?key=pk.8907c428cb018631af5ee5cd6e642477&center=${location.latitude},${location.longitude}&zoom=16&size=800x800&format=png&maptype=streets&markers=icon:large-blue-cutout|${location.latitude},${location.longitude}` }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        )}
        
        {/* Overlay for grid feeling (optional, gives a tech look) */}
        <View style={[styles.gridContainer, { opacity: 0.2 }]}>
          {[...Array(10)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineH, { top: `${i * 10}%`, backgroundColor: isDarkMode ? '#fff' : '#000' }]} />
          ))}
        </View>
        
        {/* Passenger Marker (Custom overlay) */}
        <View style={[styles.passengerMarker, { position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }]}>
          <View style={[styles.passengerMarkerInner, { borderColor: isDarkMode ? theme.card : 'white' }]} />
        </View>

        {/* Nearby Drivers Simulation */}
        {nearbyDrivers.length > 0 && (
          nearbyDrivers.map((driver, index) => (
            <View 
              key={driver.driverId || index} 
              style={{ position: 'absolute', top: `${45 + (index * 5)}%`, left: `${40 + (index * 8)}%` }}
            >
              <Text style={{ fontSize: 32 }}>🏍️</Text>
            </View>
          ))
        )}
      </View>

      {/* FLOATING TOP BAR & SEARCH */}
      <SafeAreaView style={styles.topArea}>
        {rideState === 'idle' && (
          <View style={[styles.searchCard, { backgroundColor: theme.card }]}>
            <TouchableOpacity style={styles.menuBtn} onPress={handleLogout}>
              <Text style={[styles.menuIcon, { color: theme.text }]}>☰</Text>
            </TouchableOpacity>
            
            <View style={styles.searchInputs}>
              <View style={styles.inputRow}>
                <View style={styles.dotOrigin} />
                <Text style={[styles.searchPlaceholder, { color: theme.textMuted }]}>Ubicación actual</Text>
              </View>
              <View style={[styles.searchDivider, { backgroundColor: theme.border }]} />
              <View style={styles.inputRow}>
                <View style={[styles.squareDest, { backgroundColor: theme.text }]} />
                <Text style={[styles.searchPlaceholder, {color: destination ? theme.text : theme.textMuted, fontWeight: destination ? '700' : '500'}]}>
                  {destination ? 'Destino seleccionado' : '¿A dónde vas?'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
              <Text style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* BOTTOM SHEET / DASHBOARD */}
      <View style={[styles.bottomSheet, { backgroundColor: theme.card, shadowColor: isDarkMode ? '#000' : '#888' }]}>
        {rideState === 'idle' && (
          <>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Elige un viaje</Text>
            
            {!destination ? (
              <View style={[styles.instructionsBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : theme.bg }]}>
                <Text style={[styles.instructionsText, { color: theme.text }]}>Toca el mapa para indicar a dónde vas</Text>
              </View>
            ) : (
              <View style={[styles.quoteCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: theme.text }]}>
                <Text style={{fontSize: 40}}>🏍️</Text>
                <View style={styles.quoteInfo}>
                  <Text style={[styles.quoteType, { color: theme.text }]}>MotoTaxi Seguro</Text>
                  <Text style={[styles.quoteTime, { color: theme.textMuted }]}>Llega en aprox. 5 min</Text>
                </View>
                <Text style={[styles.quotePrice, { color: theme.text }]}>${estimatedPrice}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.mainBtn, { backgroundColor: theme.text }, !destination && { backgroundColor: theme.border }]} 
              onPress={requestRide}
              disabled={!destination}
            >
              <Text style={styles.mainBtnText}>Confirmar Viaje</Text>
            </TouchableOpacity>
          </>
        )}

        {rideState === 'searching' && (
          <View style={styles.searchingBox}>
            <View style={[styles.radarCircle, { backgroundColor: theme.primaryGlow }]}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
            <Text style={[styles.searchingText, { color: theme.text }]}>Conectando con conductores...</Text>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.bg }]} onPress={cancelSearch}>
              <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {rideState === 'accepted' && (
          <View style={[styles.activeRideBox, { backgroundColor: theme.card }]}>
            <View style={styles.driverInfoHeader}>
              <Text style={{fontSize: 40}}>🏍️</Text>
              <View style={{marginLeft: 16}}>
                <Text style={[styles.rideStatusTitle, { color: theme.text }]}>Tu conductor está en camino</Text>
                <Text style={[styles.rideStatusSub, { color: theme.textMuted }]}>Conductor ID: {driverInfo?.driverId?.split('-')[0]}</Text>
              </View>
            </View>
            <View style={styles.rideActionsRow}>
              <TouchableOpacity style={[styles.chatActionBtn, { backgroundColor: theme.bg, flex: 1, marginRight: 8 }]} onPress={() => {
                setIsChatVisible(true);
                isChatVisibleRef.current = true;
                setUnreadCount(0);
              }}>
                <Text style={[styles.chatActionText, { color: theme.text }]}>Mensaje</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelRideBtn, { backgroundColor: theme.danger + '20', flex: 1 }]} onPress={cancelRide}>
                <Text style={[styles.cancelRideText, { color: theme.danger }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {rideState === 'in_progress' && (
          <View style={[styles.activeRideBox, { backgroundColor: theme.card }]}>
            <View style={styles.driverInfoHeader}>
              <Text style={{fontSize: 40}}>📍</Text>
              <View style={{marginLeft: 16}}>
                <Text style={[styles.rideStatusTitle, { color: theme.text }]}>Viaje en Curso</Text>
                <Text style={[styles.rideStatusSub, { color: theme.textMuted }]}>Disfruta tu recorrido</Text>
              </View>
            </View>
            <View style={styles.rideActionsRow}>
              <TouchableOpacity style={[styles.chatActionBtn, { backgroundColor: theme.bg, flex: 1, marginRight: 8 }]} onPress={() => {
                setIsChatVisible(true);
                isChatVisibleRef.current = true;
                setUnreadCount(0);
              }}>
                <Text style={[styles.chatActionText, { color: theme.text }]}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelRideBtn, { backgroundColor: theme.danger + '20', flex: 1 }]} onPress={cancelRide}>
                <Text style={[styles.cancelRideText, { color: theme.danger }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {rideState === 'completed' && (
          <View style={[styles.activeRideBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.rideStatusTitle, {textAlign: 'center', marginBottom: 8, color: theme.text }]}>¡Llegaste a tu destino!</Text>
            <Text style={[styles.quotePrice, {textAlign: 'center', marginBottom: 8, color: theme.text }]}>Total: ${estimatedPrice}</Text>
            
            <Text style={[styles.ratingLabel, { color: theme.textMuted }]}>Califica tu viaje</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={{ fontSize: 40, marginHorizontal: 4 }}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.text, marginTop: 20 }]} onPress={submitRating}>
              <Text style={styles.mainBtnText}>Enviar y Finalizar</Text>
            </TouchableOpacity>
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
        currentUserId={user?.id || 'passenger-demo'}
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

      {(rideState === 'accepted' || rideState === 'in_progress') && (
        <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
          <Text style={styles.sosText}>S.O.S</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  simulatedMap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
  gridLineV: {
    position: 'absolute',
    height: '100%',
    width: 1,
  },
  street: {
    position: 'absolute',
    opacity: 0.5,
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
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
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
  destinationMarker: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationSquare: {
    width: 14,
    height: 14,
  },
  topArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  searchCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  menuBtn: {
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 24,
  },
  searchInputs: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dotOrigin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 12,
  },
  squareDest: {
    width: 8,
    height: 8,
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchDivider: {
    height: 1,
    marginLeft: 20,
    marginVertical: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  instructionsBox: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionsText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  quoteInfo: {
    flex: 1,
    marginLeft: 16,
  },
  quoteType: {
    fontWeight: '800',
    fontSize: 18,
  },
  quoteTime: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  quotePrice: {
    fontSize: 22,
    fontWeight: '900',
  },
  mainBtn: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  mainBtnDisabled: {
  },
  mainBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  searchingBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  radarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchingText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 24,
  },
  cancelBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
  activeRideBox: {
  },
  driverInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rideStatusTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  rideStatusSub: {
    marginTop: 4,
    fontSize: 16,
  },
  chatActionBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatActionText: {
    fontWeight: '700',
    fontSize: 16,
  },
  themeBtn: {
    marginLeft: 10,
    padding: 5,
  },
  rideActionsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  cancelRideBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cancelRideText: {
    fontWeight: '700',
    fontSize: 16,
  },
  unreadBadge: {
    position: 'absolute',
    bottom: 300,
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
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
