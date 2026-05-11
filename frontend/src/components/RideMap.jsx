import { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, AlertTriangle } from 'lucide-react';
import { socket, sendMessage, sendEmergencyCall } from '../socket';
import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function RideMap({ ride, user }) {
  const [driverLocation, setDriverLocation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [position, setPosition] = useState(null);

  useEffect(() => {
    socket.on('driversUpdate', (drivers) => {
      const driver = drivers.find((d) => d.driverId === ride.driverId);
      if (driver) {
        setDriverLocation(driver);
      }
    });

    socket.on('newMessage', (msg) => {
      if (msg.rideId === ride.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('driversUpdate');
      socket.off('newMessage');
    };
  }, [ride.id, ride.driverId]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(ride.id, user.id, messageText);
      setMessages((prev) => [
        ...prev,
        {
          rideId: ride.id,
          senderId: user.id,
          message: messageText,
          timestamp: new Date()
        }
      ]);
      setMessageText('');
    }
  };

  const handleEmergency = () => {
    if (confirm('¿Llamar a emergencias?')) {
      sendEmergencyCall(user.id, {
        latitude: driverLocation?.latitude || 0,
        longitude: driverLocation?.longitude || 0
      });
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return position === null ? null : (
      <Marker position={position}></Marker>
    );
  };

  return (
  const center = driverLocation ? [driverLocation.latitude, driverLocation.longitude] : [19.4326, -99.1332];

  return (
    <div className="space-y-4">
      {/* Contenedor del Mapa Principal */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: '400px', width: '100%' }}>
        <MapContainer 
          center={center} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url={`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=pk.8907c428cb018631af5ee5cd6e642477`}
            attribution="&copy; LocationIQ | &copy; OpenStreetMap contributors"
          />
          
          {driverLocation && (
            <Marker position={[driverLocation.latitude, driverLocation.longitude]}>
              <div className="text-2xl">🏍️</div>
            </Marker>
          )}

          {ride?.destination && (
            <Marker position={[ride.destination.latitude, ride.destination.longitude]}>
              <div className="text-2xl">🏁</div>
            </Marker>
          )}

          <LocationMarker />
        </MapContainer>
      </div>

      {/* Botones de Acción Estilizados */}
      <div className="grid grid-cols-3 gap-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md">
          <Phone size={20} />
          <span>Llamar</span>
        </button>
        <button
          onClick={() => setMessageText('¿Dónde estás?')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
        >
          <MessageSquare size={20} />
          <span>Chat</span>
        </button>
        <button
          onClick={handleEmergency}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
        >
          <AlertTriangle size={20} />
          <span>S.O.S</span>
        </button>
      </div>

      {/* Chat con Diseño de Burbujas */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner">
        <div className="max-h-40 overflow-y-auto space-y-2 mb-4 pr-2">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.senderId === user.id ? 'bg-primary text-white' : 'bg-white text-gray-800 border border-gray-100 shadow-sm'}`}>
                  <p className="text-xs font-bold mb-1">{msg.senderId === user.id ? 'Tú' : 'Conductor'}</p>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4 text-xs italic">No hay mensajes aún</p>
          )}
        </div>

        {/* Input de Mensaje Pro */}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe un mensaje al conductor..."
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
          />
          <button
            onClick={handleSendMessage}
            className="bg-primary text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity active:scale-95"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
  );
}
