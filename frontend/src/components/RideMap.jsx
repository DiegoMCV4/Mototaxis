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
    <div className="space-y-3 text-sm">
      {/* Ubicación en Mapa */}
      <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center border border-gray-300 relative overflow-hidden">
        <div className="text-center">
          {driverLocation ? (
            <>
              <p className="text-gray-600">📍 Conductor cerca</p>
              <p className="text-xs text-gray-500 mt-1">
                {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}
              </p>
              <div className="mt-2 text-xl animate-pulse">🏍️</div>
            </>
          ) : (
            <p className="text-gray-500">Esperando ubicación del conductor...</p>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="grid grid-cols-3 gap-2">
        <button className="bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-600">
          <Phone size={16} />
          Llamar
        </button>
        <button
          onClick={() => setMessageText('¿Dónde está?')}
          className="bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-green-600"
        >
          <MessageSquare size={16} />
          Chat
        </button>
        <button
          onClick={handleEmergency}
          className="bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-red-600"
        >
          <AlertTriangle size={16} />
          SOS
        </button>
      </div>

      {/* Chat */}
      {messages.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto border border-gray-200">
          {messages.map((msg, idx) => (
            <p key={idx} className="text-xs mb-1">
              <span className="font-semibold">{msg.senderId === user.id ? 'Tú' : 'Conductor'}:</span> {msg.message}
            </p>
          ))}
        </div>
      )}

      {/* Input Chat */}
      <div className="flex gap-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Mensaje..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSendMessage}
          className="bg-primary text-white px-3 py-2 rounded-lg text-xs hover:opacity-90"
        >
          Enviar
        </button>
      </div>

      {/* Mapa Interactivo */}
      <div style={{ height: '100vh', width: '100%' }}>
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  );
}
