import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, DollarSign, Users, LogOut, Clock, Play } from 'lucide-react';
import { ridesAPI } from '../api';
import { socket, emitDriverLocation } from '../socket';
import { useToast } from './Toast';

export default function DriverHome({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [latitude, setLatitude] = useState(-12.0464);
  const [longitude, setLongitude] = useState(-77.0428);
  const intervalRef = useRef(null);
  const toast = useToast();

  // Limpiar interval al desmontar el componente (fix memory leak)
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Enviar ubicación cuando el conductor está online
  useEffect(() => {
    if (isOnline && currentRide) {
      intervalRef.current = setInterval(() => {
        setLatitude((prev) => {
          const newLat = prev + (Math.random() - 0.5) * 0.001;
          emitDriverLocation(user.id, newLat, longitude, currentRide.id);
          return newLat;
        });
        setLongitude((prev) => {
          const newLon = prev + (Math.random() - 0.5) * 0.001;
          return newLon;
        });
      }, 3000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isOnline, currentRide, user.id]);

  // Escuchar nuevas solicitudes de viaje por WebSocket
  useEffect(() => {
    const handleNewRideRequest = (ride) => {
      if (isOnline && !currentRide) {
        setAvailableRides((prev) => {
          // Evitar duplicados
          if (prev.find((r) => r.id === ride.id)) return prev;
          return [...prev, ride];
        });
        toast.info(`📍 Nuevo viaje disponible: ${ride.pickupLocation}`);
      }
    };

    socket.on('newRideRequest', handleNewRideRequest);
    return () => socket.off('newRideRequest', handleNewRideRequest);
  }, [isOnline, currentRide, toast]);

  const handleGoOnline = async () => {
    setIsOnline(true);
    toast.success('¡Estás conectado! Esperando solicitudes...');

    // Cargar viajes disponibles existentes
    try {
      const response = await ridesAPI.getAvailable();
      setAvailableRides(response.data);
    } catch (error) {
      console.error('Error cargando viajes disponibles:', error);
    }

    // Verificar si tiene un viaje activo
    try {
      const activeResponse = await ridesAPI.getActive(user.id);
      if (activeResponse.data.length > 0) {
        setCurrentRide(activeResponse.data[0]);
        toast.info('Tienes un viaje activo');
      }
    } catch (error) {
      console.error('Error verificando viajes activos:', error);
    }
  };

  const handleGoOffline = () => {
    setIsOnline(false);
    setAvailableRides([]);
    socket.emit('goOffline', { driverId: user.id });

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    toast.info('Te has desconectado');
  };

  const handleAcceptRide = async (ride) => {
    try {
      const response = await ridesAPI.accept(ride.id, user.id);
      setCurrentRide(response.data);
      setAvailableRides((prev) => prev.filter((r) => r.id !== ride.id));

      // Notificar al pasajero vía WebSocket
      socket.emit('rideAccepted', response.data);
      toast.success('¡Viaje aceptado! Dirígete al punto de recogida');
    } catch (error) {
      toast.error('Error al aceptar viaje: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleStartRide = async () => {
    if (!currentRide) return;

    try {
      const response = await ridesAPI.start(currentRide.id);
      setCurrentRide({ ...currentRide, status: 'in_progress' });

      // Notificar al pasajero
      socket.emit('rideStarted', response.data);
      toast.info('🚗 Viaje iniciado. ¡Buen viaje!');
    } catch (error) {
      toast.error('Error al iniciar viaje: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCompleteRide = async () => {
    if (!currentRide) return;

    try {
      const actualPrice = currentRide.estimatedPrice + Math.random() * 5;
      const distance = (Math.random() * 8 + 2).toFixed(1);
      const duration = Math.floor(Math.random() * 20 + 5);

      const response = await ridesAPI.complete(currentRide.id, {
        actualPrice,
        distance,
        duration
      });

      // Notificar al pasajero
      socket.emit('rideCompleted', response.data);

      setEarnings((prev) => prev + actualPrice);
      setCurrentRide(null);
      toast.success(`✅ Viaje completado. Ganaste $${actualPrice.toFixed(2)}`);
    } catch (error) {
      toast.error('Error al completar viaje: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-primary dark:bg-gray-950 text-white p-4 flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-2xl font-bold">MotoTaxi Conductor</h1>
          <p className="text-sm opacity-90">{user.fullName} <span className="text-xs">🔒</span></p>
        </div>
        <button
          onClick={onLogout}
          className="text-white hover:text-gray-300 dark:hover:text-gray-400 transition"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Estado Online */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">Estado</p>
                  <p className={`text-2xl font-bold ${isOnline ? 'text-secondary' : 'text-gray-600 dark:text-gray-400'}`}>
                    {isOnline ? '✓ Conectado' : '○ Desconectado'}
                  </p>
                </div>
                <button
                  id="toggle-online-btn"
                  onClick={isOnline ? handleGoOffline : handleGoOnline}
                  className={`px-6 py-3 rounded-lg font-bold transition ${
                    isOnline ? 'bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600' : 'bg-secondary text-white hover:bg-blue-700'
                  }`}
                >
                  {isOnline ? 'Ir Offline' : 'Ir Online'}
                </button>
              </div>
            </div>

            {/* Viaje Actual */}
            {currentRide ? (
              <div className="bg-white dark:bg-gray-800 border-2 border-secondary p-4 rounded-lg shadow-sm transition-colors">
                <h3 className="font-bold text-lg mb-3 text-secondary">
                  {currentRide.status === 'accepted' ? '📍 Viaje Aceptado' : '🚗 Viaje en Curso'}
                </h3>
                <div className="space-y-2 text-sm mb-4">
                  <p>
                    <MapPin size={16} className="inline mr-2 text-gray-500 dark:text-gray-400" />
                    <strong className="text-gray-900 dark:text-white">De:</strong> <span className="text-gray-800 dark:text-gray-200">{currentRide.pickupLocation}</span>
                  </p>
                  <p>
                    <MapPin size={16} className="inline mr-2 text-gray-500 dark:text-gray-400" />
                    <strong className="text-gray-900 dark:text-white">A:</strong> <span className="text-gray-800 dark:text-gray-200">{currentRide.dropoffLocation}</span>
                  </p>
                  <p className="text-gray-900 dark:text-white font-bold">
                    <DollarSign size={16} className="inline mr-2" />
                    Precio: ${currentRide.estimatedPrice}
                  </p>
                </div>
                <div className="space-y-2">
                  {currentRide.status === 'accepted' && (
                    <button
                      id="start-ride-btn"
                      onClick={handleStartRide}
                      className="w-full bg-secondary text-white py-2 rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2 transition"
                    >
                      <Play size={18} />
                      Iniciar Viaje
                    </button>
                  )}
                  <button
                    id="complete-ride-btn"
                    onClick={handleCompleteRide}
                    disabled={currentRide.status === 'accepted'}
                    className="w-full bg-primary dark:bg-gray-700 text-white py-2 rounded-lg hover:bg-black dark:hover:bg-gray-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ✓ Completar Viaje
                  </button>
                </div>
              </div>
            ) : isOnline ? (
              <>
                {/* Viajes Disponibles */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">📍 Viajes Disponibles ({availableRides.length})</h3>
                  {availableRides.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">Esperando solicitudes...</p>
                  ) : (
                    <div className="space-y-3">
                      {availableRides.map((ride) => (
                        <div key={ride.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors">
                          <p className="font-semibold text-sm mb-1">
                            {ride.passengerName && <span className="text-gray-500 dark:text-gray-400">👤 {ride.passengerName} </span>}
                            {ride.passengerRating && <span className="text-yellow-500">⭐ {ride.passengerRating}</span>}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                            {ride.pickupLocation} → {ride.dropoffLocation}
                          </p>
                          <p className="text-primary dark:text-blue-400 font-bold">
                            <DollarSign size={14} className="inline mr-1" />
                            ${ride.estimatedPrice}
                          </p>
                          <button
                            onClick={() => handleAcceptRide(ride)}
                            className="w-full mt-2 bg-secondary text-white py-2 rounded-lg hover:bg-blue-700 font-bold transition"
                          >
                            Aceptar Viaje
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Conéctate para ver viajes disponibles</p>
              </div>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                <DollarSign className="text-secondary mx-auto mb-2" size={28} />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Ganancias Hoy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${earnings.toFixed(2)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                <Users className="text-secondary mx-auto mb-2" size={28} />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">⭐ {user.rating}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Estadísticas</h2>
            <div className="bg-primary dark:bg-gray-800 border dark:border-gray-700 text-white p-4 rounded-lg shadow-sm transition-colors">
              <p className="text-gray-300 mb-1">Ganancias Totales</p>
              <p className="text-4xl font-bold">${earnings.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Viajes Completados: {Math.floor(earnings / 20)}</p>
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Rating: ⭐ {user.rating}</p>
              <p className="font-semibold text-gray-900 dark:text-white">Ubicación: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 dark:border-gray-800 flex bg-white dark:bg-gray-900 transition-colors">
        <button
          id="nav-driver-home"
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-3 text-center font-semibold transition-colors ${
            activeTab === 'home' 
              ? 'text-primary dark:text-white border-t-4 border-primary dark:border-gray-400' 
              : 'text-gray-600 dark:text-gray-500'
          }`}
        >
          <MapPin size={20} className="mx-auto" />
          <span className="text-xs">Inicio</span>
        </button>
        <button
          id="nav-driver-stats"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 text-center font-semibold transition-colors ${
            activeTab === 'stats' 
              ? 'text-primary dark:text-white border-t-4 border-primary dark:border-gray-400' 
              : 'text-gray-600 dark:text-gray-500'
          }`}
        >
          <Clock size={20} className="mx-auto" />
          <span className="text-xs">Estadísticas</span>
        </button>
      </div>
    </div>
  );
}
