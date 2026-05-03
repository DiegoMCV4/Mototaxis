class TrackingSocketHandler {
  constructor(io, trackingUseCases) {
    this.io = io;
    this.trackingUseCases = trackingUseCases;
    this.connectedDrivers = [];
  }

  handleConnection(socket) {
    console.log('📍 Usuario conectado al tracking (Hexagonal):', socket.id);

    socket.on('driverLocation', async (data) => {
      const { driverId, latitude, longitude, rideId } = data;
      
      // Actualizar en memoria
      this.connectedDrivers = this.connectedDrivers.filter(d => d.socketId !== socket.id);
      this.connectedDrivers.push({
        socketId: socket.id,
        driverId,
        latitude,
        longitude,
        rideId,
        timestamp: new Date()
      });

      // Persistir
      await this.trackingUseCases.updateLocation({ driverId, latitude, longitude, isOnline: true });

      // Emitir
      this.io.emit('driversUpdate', this.connectedDrivers);
    });

    socket.on('newRideRequest', (data) => this.io.emit('newRideRequest', data));
    socket.on('rideAccepted', (data) => this.io.emit('rideAccepted', data));
    socket.on('rideStarted', (data) => this.io.emit('rideStarted', data));
    socket.on('rideCompleted', (data) => this.io.emit('rideCompleted', data));

    socket.on('message', async (data) => {
      const msg = await this.trackingUseCases.saveChatMessage(data);
      this.io.emit('newMessage', {
        ...data,
        timestamp: msg.createdAt
      });
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
