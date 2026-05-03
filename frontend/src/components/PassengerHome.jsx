import { useState, useEffect } from 'react';
import { Car, LogOut, MapPin, Clock, DollarSign, Star } from 'lucide-react';
import { ridesAPI } from '../api';
import { socket } from '../socket';
import { useToast } from './Toast';
import RideMap from './RideMap';

export default function PassengerHome({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [rideRequest, setRideRequest] = useState(null);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [rideHistory, setRideHistory] = useState([]);
  const [acceptedDriver, setAcceptedDriver] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const toast = useToast();

  // Escuchar eventos de WebSocket
  useEffect(() => {
    const handleRideAccepted = (ride) => {
      if (rideRequest && ride.id === rideRequest.id) {
        setAcceptedDriver(ride);
        setActiveTab('tracking');
        toast.success('¡Un conductor aceptó tu viaje!');
      }
    };

    const handleRideStarted = (ride) => {
      if (rideRequest && ride.id === rideRequest.id) {
        toast.info('🚗 Tu viaje ha iniciado');
      }
    };

    const handleRideCompleted = (ride) => {
      if (rideRequest && ride.id === rideRequest.id) {
        toast.success('✅ Viaje completado. ¡Gracias por viajar con MotoTaxi!');
        setRideRequest(null);
        setAcceptedDriver(null);
        setActiveTab('home');
      }
    };

    socket.on('rideAccepted', handleRideAccepted);
    socket.on('rideStarted', handleRideStarted);
    socket.on('rideCompleted', handleRideCompleted);

    return () => {
      socket.off('rideAccepted', handleRideAccepted);
      socket.off('rideStarted', handleRideStarted);
      socket.off('rideCompleted', handleRideCompleted);
    };
  }, [rideRequest, toast]);

  // Verificar si hay viajes activos al cargar
  useEffect(() => {
    const checkActiveRides = async () => {
      try {
        const response = await ridesAPI.getActive(user.id);
        if (response.data.length > 0) {
          const activeRide = response.data[0];
          setRideRequest(activeRide);
          if (activeRide.status === 'accepted' || activeRide.status === 'in_progress') {
            setAcceptedDriver(activeRide);
            setActiveTab('tracking');
          }
        }
      } catch (error) {
        console.error('Error cargando viajes activos:', error);
      }
    };
    checkActiveRides();
  }, [user.id]);

  const handleRequestRide = async () => {
    if (!pickup || !dropoff) {
      toast.warning('Por favor completa la ubicación de recogida y destino');
      return;
    }

    setRequesting(true);
    try {
      const estimatedPrice = Math.floor(Math.random() * 50) + 10;
      const response = await ridesAPI.request({
        passengerId: user.id,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        paymentMethod,
        estimatedPrice
      });

      setRideRequest(response.data);
      toast.success('Viaje solicitado. Buscando conductor...');
    } catch (error) {
      toast.error('Error al solicitar viaje: ' + (error.response?.data?.error || error.message));
    } finally {
      setRequesting(false);
    }
  };

  const handleCancelRide = async () => {
    if (rideRequest) {
      try {
        await ridesAPI.cancel(rideRequest.id);
        setRideRequest(null);
        setAcceptedDriver(null);
        setActiveTab('home');
        toast.info('Viaje cancelado');
      } catch (error) {
        toast.error('Error al cancelar: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const fetchRideHistory = async () => {
    try {
      const response = await ridesAPI.getHistory(user.id);
      setRideHistory(response.data);
      setActiveTab('history');
    } catch (error) {
      toast.error('Error cargando historial');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-primary dark:bg-gray-950 text-white p-4 flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-2xl font-bold">MotoTaxi</h1>
          <p className="text-sm opacity-90">{user.fullName} <span className="text-xs">🔒</span></p>
        </div>
        <button
          onClick={onLogout}
          className="text-white hover:text-gray-300 dark:hover:text-gray-400 transition"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <div className="p-4">
            {!rideRequest ? (
              <div className="space-y-4">
                {/* Solicitar Viaje */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Solicitar Viaje</h2>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        <MapPin size={16} className="inline mr-2" />
                        Ubicación de Recogida
                      </label>
                      <input
                        id="pickup-input"
                        type="text"
                        placeholder="Calle, edificio, piso"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        <MapPin size={16} className="inline mr-2" />
                        Destino
                      </label>
                      <input
                        id="dropoff-input"
                        type="text"
                        placeholder="Calle, edificio, piso"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        <DollarSign size={16} className="inline mr-2" />
                        Método de Pago
                      </label>
                      <select
                        id="payment-select"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="card">Tarjeta</option>
                        <option value="cash">Efectivo</option>
                        <option value="wallet">Billetera Digital</option>
                      </select>
                    </div>

                    <button
                      id="request-ride-btn"
                      onClick={handleRequestRide}
                      disabled={requesting}
                      className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {requesting ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Solicitando...
                        </>
                      ) : (
                        <>
                          <Car size={20} />
                          Solicitar Viaje
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Info rápida */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center shadow-sm transition-colors">
                    <DollarSign className="text-secondary mx-auto mb-1" size={24} />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Saldo: ${user.walletBalance}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center shadow-sm transition-colors">
                    <Star className="text-secondary mx-auto mb-1" size={24} />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Rating: {user.rating}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center shadow-sm transition-colors">
                    <Car className="text-secondary mx-auto mb-1" size={24} />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.rides} viajes</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="bg-white dark:bg-gray-800 border-2 border-secondary p-4 rounded-lg shadow-sm transition-colors">
                  <h3 className="font-bold text-lg mb-2 text-secondary">🔍 Buscando Conductor...</h3>
                  <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
                    <p>
                      <MapPin size={16} className="inline mr-2 text-gray-500" />
                      <strong>De:</strong> {rideRequest.pickupLocation}
                    </p>
                    <p>
                      <MapPin size={16} className="inline mr-2 text-gray-500" />
                      <strong>A:</strong> {rideRequest.dropoffLocation}
                    </p>
                    <p className="text-gray-900 dark:text-white font-bold">
                      <DollarSign size={16} className="inline mr-2" />
                      Precio estimado: ${rideRequest.estimatedPrice}
                    </p>
                  </div>
                  <button
                    id="cancel-ride-btn"
                    onClick={handleCancelRide}
                    className="w-full mt-3 bg-white dark:bg-gray-700 border border-black dark:border-gray-600 text-black dark:text-white py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 font-bold transition"
                  >
                    Cancelar Solicitud
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracking' && acceptedDriver && (
          <div className="p-4">
            <div className="bg-white dark:bg-gray-800 border-2 border-primary dark:border-gray-700 p-4 rounded-lg mb-4 shadow-sm transition-colors">
              <h3 className="font-bold text-primary dark:text-white mb-2 flex items-center gap-2">
                <span className="text-secondary">✓</span> Conductor en Camino
              </h3>
            </div>
            <RideMap ride={acceptedDriver} user={user} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Historial de Viajes</h2>
            {rideHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay viajes completados</p>
            ) : (
              <div className="space-y-3">
                {rideHistory.map((ride) => (
                  <div key={ride.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                    <p className="font-semibold text-gray-900 dark:text-white">{ride.pickupLocation} → {ride.dropoffLocation}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign size={14} className="inline mr-1" />
                      ${ride.actualPrice}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(ride.endTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 dark:border-gray-800 flex bg-white dark:bg-gray-900 transition-colors">
        <button
          id="nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-3 text-center font-semibold transition-colors ${
            activeTab === 'home' 
              ? 'text-primary dark:text-white border-t-4 border-primary dark:border-gray-400' 
              : 'text-gray-600 dark:text-gray-500'
          }`}
        >
          <Car size={20} className="mx-auto" />
          <span className="text-xs">Inicio</span>
        </button>
        <button
          id="nav-history"
          onClick={fetchRideHistory}
          className={`flex-1 py-3 text-center font-semibold transition-colors ${
            activeTab === 'history' 
              ? 'text-primary dark:text-white border-t-4 border-primary dark:border-gray-400' 
              : 'text-gray-600 dark:text-gray-500'
          }`}
        >
          <Clock size={20} className="mx-auto" />
          <span className="text-xs">Historial</span>
        </button>
      </div>
    </div>
  );
}
