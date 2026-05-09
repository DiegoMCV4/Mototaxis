# 🧪 Testing Chat & Ride Cancellation

## ✅ What Was Fixed

### 1. Ride State Database Persistence
- When passenger requests ride → `newRideRequest` handler creates ride record in DB
- When ride is accepted → Status updated to `'accepted'`
- When ride starts → Status updated to `'in_progress'`
- When ride completes → Status updated to `'completed'`
- When ride is cancelled → Status updated to `'cancelled'`

### 2. Chat Message Flow
```
Passenger: onSendMessage() → socket.emit('message', {rideId, senderId, text})
   ↓
Server: Validates rideId exists in rides table
   ↓
Server: Saves message to messages table (FK to rides table)
   ↓
Server: Broadcasts to room 'ride_{rideId}' → socket.emit('newMessage')
   ↓
Driver/Passenger: Receives 'newMessage' → Updates UI with new message
```

### 3. Ride Cancellation Flow
```
Passenger/Driver: cancelRide() → socket.emit('rideCancelled', {rideId, cancelledBy})
   ↓
Server: Updates rides.status = 'cancelled' in DB
   ↓
Server: Broadcasts to room 'ride_{rideId}' → socket.emit('rideCancelled')
   ↓
Both clients: Receive cancellation → Reset UI state
```

---

## 🚀 Testing Checklist

### Prerequisites
- API Gateway running on `http://10.222.49.11:3000`
- Tracking Service running on port `3004`
- MySQL database with rides and messages tables
- Both mobile/web clients connected to the same API Gateway

### Test 1: Basic Chat Message
1. Start two mobile clients (or one mobile + one web)
2. One client requests a ride (Passenger)
3. Other client accepts ride (Driver)
4. **Test**: Passenger sends a message
   - ✅ Expected: Message appears in both UIs
   - ✅ Expected: `LOG ✅ Mensaje guardado` in server logs
   - ✅ Expected: Message visible in MySQL `messages` table
   - ✅ Expected: `messageSent` confirmation returned to sender

### Test 2: Multiple Messages
1. With ride accepted, exchange 5-10 messages back and forth
   - ✅ Expected: All messages persist in DB
   - ✅ Expected: Correct senderId for each message
   - ✅ Expected: Timestamps in correct order

### Test 3: Ride State Transitions
1. Request ride → Check `rides.status = 'searching'` in DB
2. Accept ride → Check `rides.status = 'accepted'` in DB
3. Start ride → Check `rides.status = 'in_progress'` in DB
4. Complete ride → Check `rides.status = 'completed'` in DB

### Test 4: Ride Cancellation
1. Request ride and accept it
2. **Test**: Passenger clicks "Cancelar viaje"
   - ✅ Expected: `LOG 🚫 Viaje cancelado:` in server logs
   - ✅ Expected: Both clients receive `rideCancelled` event
   - ✅ Expected: rides.status = 'cancelled' in DB
   - ✅ Expected: Both UIs reset (hide chat, show "Solicitar viaje" button)

### Test 5: Cancel During Chat
1. Request ride → Accept → Send multiple messages
2. **Test**: Driver cancels mid-chat
   - ✅ Expected: Passenger receives cancellation
   - ✅ Expected: Chat closes/disables
   - ✅ Expected: Messages from before cancellation still visible in history

### Test 6: WebSocket Stability
1. Keep chat open for 2+ minutes
   - ✅ Expected: No "transport error" disconnections
   - ✅ Expected: No repeated reconnection logs
2. Send message → Accept ride → Send message again
   - ✅ Expected: Smooth operation, no connection drops

---

## 📊 Server Logs to Monitor

### Successful Chat Flow
```
✅ Evento message recibido: {...}
💬 Guardando mensaje para ride_{rideId}...
💬 ✅ Mensaje guardado. Emitiendo a sala ride_{rideId}
```

### Successful Ride Acceptance
```
✅ Estado de viaje {rideId} actualizado a accepted
```

### Successful Cancellation
```
🚫 Viaje cancelado: {rideId} por {cancelledBy}
✅ Estado de viaje {rideId} actualizado a cancelled
```

### Errors to Watch For
```
❌ Mensaje sin rideId  → Client not sending rideId
❌ Error guardando mensaje  → Database issue
⚠️ No se pudo actualizar viaje en BD  → Database connection problem
❌ transport error  → WebSocket proxy issue
```

---

## 🔧 Database Verification

```sql
-- Check rides created
SELECT id, passengerId, status, createdAt FROM rides ORDER BY createdAt DESC LIMIT 5;

-- Check messages for a ride
SELECT * FROM messages WHERE rideId = 'ride-{timestamp}' ORDER BY createdAt;

-- Verify FK constraint
SELECT * FROM information_schema.REFERENTIAL_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'your_db' AND TABLE_NAME = 'messages';
```

---

## 🐛 Debugging Tips

### If Chat Messages Not Appearing
1. Check server logs for "Evento message recibido"
2. Verify MySQL messages table has the record
3. Verify rides table has matching rideId
4. Check if client is sending correct rideId in message event
5. Verify socket room subscription with `joinRide` event

### If Ride Cancellation Not Working
1. Check server logs for "Viaje cancelado" event
2. Verify rides.status was updated in database
3. Ensure both clients joined the ride room with `joinRide`
4. Check if cancellation event is emitted with correct rideId

### If Getting "transport error"
1. Verify API Gateway has `http.createServer()` 
2. Check proxy timeout settings (should be 60000ms)
3. Verify Socket.IO version in both client and server
4. Check CORS settings allow your domain

---

## ✨ Success Criteria

All of the following must work:

- [ ] ✅ Ride created in database on `newRideRequest`
- [ ] ✅ Chat message sent and received by both clients
- [ ] ✅ Message persisted in MySQL
- [ ] ✅ Ride status transitions (searching → accepted → in_progress → completed/cancelled)
- [ ] ✅ Ride cancellation updates database status
- [ ] ✅ Both clients notified of cancellation
- [ ] ✅ No "transport error" disconnections
- [ ] ✅ Socket connections remain stable for 2+ minutes

