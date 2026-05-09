class TrackingSocketHandler {
  constructor(io, trackingUseCases) {
    this.io = io;
    this.trackingUseCases = trackingUseCases;
    this.connectedDrivers = [];
  }

  handleConnection(socket) {
    console.log('📍 Usuario conectado al tracking (Hexagonal):', socket.id);
    console.log('📊 Socket rooms iniciales:', Object.keys(socket.rooms));

    socket.on('joinRide', (rideId) => {
      socket.join(`ride_${rideId}`);
      console.log(`👥 Socket ${socket.id} se unió a la sala: ride_${rideId}`);
      console.log(`📊 Rooms del socket después de join:`, Object.keys(socket.rooms));
      console.log(`📊 Clientes en sala ride_${rideId}:`, Object.keys(this.io.sockets.adapter.rooms[`ride_${rideId}`] || {}));
    });

    socket.on('driverLocation', async (data) => {
      const { driverId, latitude, longitude, rideId } = data;
      
      this.connectedDrivers = this.connectedDrivers.filter(d => d.socketId !== socket.id);
      this.connectedDrivers.push({
        socketId: socket.id,
        driverId,
        latitude,
        longitude,
        rideId,
        timestamp: new Date()
      });

      await this.trackingUseCases.updateLocation({ driverId, latitude, longitude, isOnline: true });
      this.io.emit('driversUpdate', this.connectedDrivers);

      if (rideId) {
        this.io.to(`ride_${rideId}`).emit('driverLocationUpdate', { driverId, latitude, longitude });
      }
    });

    socket.on('newRideRequest', async (data) => {
      try {
        console.log('📍 Nueva solicitud de viaje:', JSON.stringify(data));
        
        const { rideId, passengerId, latitude, longitude, destination, estimatedPrice } = data;
        
        // Crear registro en BD para que luego los mensajes tengan FK válida
        if (rideId && passengerId) {
          try {
            await this.trackingUseCases.createRide({
              rideId,
              passengerId,
              pickupLocation: `Lat: ${latitude}, Lng: ${longitude}`,
              pickupLat: latitude,
              pickupLng: longitude,
              dropoffLocation: destination?.name || 'Destino',
              dropoffLat: destination?.latitude,
              dropoffLng: destination?.longitude,
              estimatedPrice: estimatedPrice || 0,
              status: 'searching'
            });
            console.log(`✅ Viaje ${rideId} creado en BD`);
          } catch (dbErr) {
            console.warn('⚠️ No se pudo crear viaje en BD (puede ya existir):', dbErr.message);
          }
        }
        
        // Emitir a todos los conductores
        this.io.emit('newRideRequest', data);
      } catch (error) {
        console.error('❌ Error en newRideRequest:', error.message);
      }
    });

    socket.on('rideAccepted', async (data) => {
      try {
         console.log(`✅ SERVIDOR recibe rideAccepted:`, JSON.stringify(data));
        socket.join(`ride_${data.rideId}`);
         console.log(`👥 Socket ${socket.id} se unió a sala: ride_${data.rideId}`);
        
        // Actualizar estado en BD
        if (data.rideId) {
          try {
            await this.trackingUseCases.updateRideStatus(data.rideId, 'accepted');
            console.log(`✅ Estado de viaje ${data.rideId} actualizado a accepted`);
          } catch (dbErr) {
            console.warn('⚠️ No se pudo actualizar viaje en BD:', dbErr.message);
          }
        }
        
         console.log(`📤 Emitiendo rideAccepted a sala ride_${data.rideId} y a todos`);
        this.io.to(`ride_${data.rideId}`).emit('rideAccepted', data);
        this.io.emit('rideAccepted', data); // fallback
         console.log(`✅ Evento rideAccepted emitido`);
      } catch (error) {
        console.error('❌ Error en rideAccepted:', error.message);
      }
    });

    socket.on('rideStarted', async (data) => {
      try {
         console.log(`🚗 SERVIDOR recibe rideStarted:`, JSON.stringify(data));
        // Actualizar estado en BD
        if (data.rideId) {
          try {
            await this.trackingUseCases.updateRideStatus(data.rideId, 'in_progress');
            console.log(`✅ Estado de viaje ${data.rideId} actualizado a in_progress`);
          } catch (dbErr) {
            console.warn('⚠️ No se pudo actualizar viaje en BD:', dbErr.message);
          }
        }
         console.log(`📤 Emitiendo rideStarted a sala ride_${data.rideId}`);
        this.io.to(`ride_${data.rideId}`).emit('rideStarted', data);
      } catch (error) {
        console.error('❌ Error en rideStarted:', error.message);
      }
    });

    socket.on('rideCompleted', async (data) => {
      try {
         console.log(`✔️ SERVIDOR recibe rideCompleted:`, JSON.stringify(data));
        // Actualizar estado en BD
        if (data.rideId) {
          try {
            await this.trackingUseCases.updateRideStatus(data.rideId, 'completed');
            console.log(`✅ Estado de viaje ${data.rideId} actualizado a completed`);
          } catch (dbErr) {
            console.warn('⚠️ No se pudo actualizar viaje en BD:', dbErr.message);
          }
        }
         console.log(`📤 Emitiendo rideCompleted a sala ride_${data.rideId}`);
        this.io.to(`ride_${data.rideId}`).emit('rideCompleted', data);
      } catch (error) {
        console.error('❌ Error en rideCompleted:', error.message);
      }
    });

    socket.on('message', async (data) => {
      try {
        console.log('📨 Evento message recibido:', JSON.stringify(data));
        console.log('📊 Datos completos del mensaje:', { rideId: data?.rideId, senderId: data?.senderId, text: data?.text });
        
        if (!data) {
          console.error('❌ Datos vacíos en message');
          return;
        }
        
        if (!data.rideId) {
          console.error('❌ Mensaje sin rideId:', data);
          socket.emit('messageError', { error: 'rideId no proporcionado' });
          return;
        }
        
        console.log(`💬 Guardando mensaje para ride_${data.rideId}...`);
        const msg = await this.trackingUseCases.saveChatMessage(data);
        console.log(`✅ Mensaje guardado en BD con ID: ${msg.id}`);
        
        const broadcastData = {
          ...data,
          message: data.text || data.message,
          timestamp: msg.createdAt || new Date(),
          id: msg.id
        };
        
        console.log(`💬 ✅ Emitiendo newMessage a sala ride_${data.rideId}`);
        console.log(`📊 Clientes en sala ride_${data.rideId}:`, Object.keys(this.io.sockets.adapter.rooms[`ride_${data.rideId}`] || {}));
        
        // Emitir a la sala del viaje
        this.io.to(`ride_${data.rideId}`).emit('newMessage', broadcastData);
        
        // Confirmar al remitente
        socket.emit('messageSent', { id: msg.id, timestamp: msg.createdAt });
        
      } catch (error) {
        console.error('❌ Error guardando mensaje:', error.message, error.stack);
        socket.emit('messageError', { error: error.message });
      }
    });

    socket.on('rideCancelled', async (data) => {
      try {
        console.log(`🚫 Viaje cancelado: ${data.rideId} por ${data.cancelledBy}`);
        console.log(`📊 Datos de cancelación:`, JSON.stringify(data));
        
        if (!data.rideId) {
          console.error('❌ cancelledBy sin rideId:', data);
          socket.emit('error', { message: 'rideId no proporcionado' });
          return;
        }
        
        // Actualizar estado en BD
        try {
          await this.trackingUseCases.updateRideStatus(data.rideId, 'cancelled');
          console.log(`✅ Estado de viaje ${data.rideId} actualizado a cancelled en BD`);
        } catch (dbErr) {
          console.warn('⚠️ No se pudo actualizar viaje en BD:', dbErr.message);
        }
        
        // Notificar a ambos en la sala
        console.log(`📊 Emitiendo rideCancelled a sala ride_${data.rideId}`);
        console.log(`📊 Clientes en sala ride_${data.rideId}:`, Object.keys(this.io.sockets.adapter.rooms[`ride_${data.rideId}`] || {}));
        
        this.io.to(`ride_${data.rideId}`).emit('rideCancelled', data);
        console.log(`✅ Evento rideCancelled emitido a la sala`);
      } catch (error) {
        console.error('❌ Error en rideCancelled:', error.message, error.stack);
      }
    });

    socket.on('emergencyCall', (data) => {
      this.io.emit('emergencyAlert', data);
      console.log('⚠️ LLAMADA DE EMERGENCIA:', data);
    });

    socket.on('goOffline', async (data) => {
      await this.trackingUseCases.setDriverOffline(data.driverId);
    });

    socket.on('disconnect', async () => {
      const disconnectedDriver = this.connectedDrivers.find(d => d.socketId === socket.id);
      this.connectedDrivers = this.connectedDrivers.filter(d => d.socketId !== socket.id);

      if (disconnectedDriver) {
        await this.trackingUseCases.setDriverOffline(disconnectedDriver.driverId);
      }
      console.log('📍 Usuario desconectado:', socket.id);
    });
  }
}

module.exports = TrackingSocketHandler;
