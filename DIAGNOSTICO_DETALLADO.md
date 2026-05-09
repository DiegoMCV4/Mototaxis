# 🔧 DIAGNÓSTICO Y TESTING - Chat & Cancelación

## Estado Actual

Se han agregado logs detallados en el cliente y servidor para diagnosticar exactamente qué está pasando.

---

## 📋 Qué Verificar

### Paso 1: Revisar Logs del Servidor

Mientras el servidor corre (`npm start` en `services/tracking-service`), debes ver:

#### Cuando el Pasajero Solicita Viaje:
```
📍 Usuario conectado al tracking: socket-id
📍 PASSENGER emite joinRide con ride-1234567890
👥 Socket socket-id se unió a la sala: ride_ride-1234567890
📍 PASSENGER emite newRideRequest
📍 Nueva solicitud de viaje: {...}
✅ Viaje ride-1234567890 creado en BD
```

#### Cuando el Conductor Acepta:
```
✅ DRIVER emite rideAccepted
👥 Socket socket-id se unió a la sala: ride_ride-1234567890
✅ Estado de viaje ride-1234567890 actualizado a accepted en BD
```

#### Cuando se Envía un Mensaje:
```
📨 Evento message recibido: {...}
📊 Datos completos del mensaje: {rideId: "ride-...", senderId: "...", text: "..."}
💬 Guardando mensaje para ride_ride-...
✅ Mensaje guardado en BD con ID: msg-id
💬 ✅ Emitiendo newMessage a sala ride_ride-...
📊 Clientes en sala ride_ride-...: ["socket1", "socket2"]
✅ Evento newMessage emitido a la sala
```

#### Cuando se Cancela:
```
🚫 Viaje cancelado: ride-... por driver/passenger
📊 Datos de cancelación: {...}
✅ Estado de viaje ride-... actualizado a cancelled en BD
📊 Emitiendo rideCancelled a sala ride_ride-...
📊 Clientes en sala ride_ride-...: ["socket1", "socket2"]
✅ Evento rideCancelled emitido a la sala
```

---

## 🧪 Plan de Prueba

### Test 1: Verificar Conexión WebSocket

1. Abre **un cliente** (pasajero o conductor)
2. Mira en los logs del servidor:
   - **Debe ver**: `📍 Usuario conectado al tracking: socket-xxxx`
   - **Si no lo ves**: El WebSocket no está conectando

### Test 2: Verificar Solicitud de Viaje (Pasajero)

1. **Pasajero** solicita un viaje (toca "Solicitar viaje")
2. Mira en los logs del servidor:
   - ✅ `📍 PASSENGER emite joinRide`
   - ✅ `👥 Socket se unió a la sala`
   - ✅ `📍 Nueva solicitud de viaje`
   - ✅ `✅ Viaje ... creado en BD`

**Si falta algo:**
- Si no ves "joinRide" → El cliente no está emitiendo
- Si no ves "Nueva solicitud" → El servidor no está recibiendo
- Si no ves "creado en BD" → La base de datos tiene problema

### Test 3: Aceptación de Viaje (Conductor)

1. **Conductor** abre la app
2. **Conductor** acepta el viaje (toca "Aceptar")
3. Mira en los logs del servidor:
   - ✅ `✅ DRIVER emite rideAccepted`
   - ✅ `👥 Socket se unió a la sala: ride_...`
   - ✅ `✅ Estado de viaje ... actualizado a accepted en BD`

### Test 4: Envío de Mensaje

1. Con viaje aceptado entre Pasajero y Conductor
2. **Pasajero** envía un mensaje "Hola"
3. Mira en los logs del servidor:
   - ✅ `📨 Evento message recibido`
   - ✅ `📊 Datos completos del mensaje: {rideId: "...", senderId: "...", text: "Hola"}`
   - ✅ `💬 Guardando mensaje`
   - ✅ `✅ Mensaje guardado en BD`
   - ✅ `📊 Clientes en sala ride_ride-...: ["socket1", "socket2"]` (debe haber 2)
   - ✅ `✅ Evento newMessage emitido`

4. Verifica que el **Conductor** recibió el mensaje en su pantalla

**Si falta:**
- Si no ves "Evento message recibido" → El cliente no está emitiendo
- Si ves "Clientes en sala: []" → Nadie está en la sala (no se ejecutó joinRide)
- Si ves "Clientes en sala: ["socket1"]" → Solo el remitente está en la sala
- Si ves error en BD → Base de datos tiene FK problema

### Test 5: Cancelación de Viaje

1. Con viaje aceptado
2. **Pasajero** toca "Cancelar viaje"
3. Mira en los logs del servidor:
   - ✅ `🚫 Viaje cancelado`
   - ✅ `📊 Datos de cancelación: {...}`
   - ✅ `✅ Estado de viaje ... actualizado a cancelled en BD`
   - ✅ `📊 Clientes en sala ride_ride-...: ["socket1", "socket2"]` (debe haber 2)
   - ✅ `✅ Evento rideCancelled emitido`

4. Verifica que el **Conductor** ve el viaje cancelado en su pantalla

---

## 🔍 Problemas Comunes y Soluciones

### ❌ "No veo logs del servidor"
- ¿El servidor está corriendo? `npm start`
- ¿En el directorio correcto? `cd services/tracking-service`
- ¿El cliente está conectando a `http://10.222.49.11:3000`?

### ❌ "Veo 'joinRide' pero no 'Nueva solicitud'"
- El cliente envía joinRide pero no newRideRequest
- **Solución**: Verifica que el cliente tenga socket conectado

### ❌ "No veo '✅ Viaje creado en BD'"
- El servidor recibe newRideRequest pero falla al guardar
- **Solución**: Verifica base de datos MySQL está conectada
- Ejecuta: `SELECT * FROM rides ORDER BY created_at DESC;`

### ❌ "Veo un solo cliente en la sala"
```
📊 Clientes en sala ride_ride-...: ["socket1"]
```
- Solo el remitente está en la sala
- El otro no ejecutó `joinRide`
- **Solución**: Verifica que el conductor ejecute `joinRide` al aceptar

### ❌ "Mensaje no aparece en el otro cliente"
```
✅ Evento newMessage emitido a la sala
```
pero el otro cliente no lo ve
- El servidor lo emitió, pero:
  - El otro cliente no está en la sala
  - El otro cliente desconectó
  - El nombre del evento es diferente

---

## 📊 Estructura de Datos Esperada

### Mensaje Emitido por Cliente
```javascript
{
  rideId: "ride-1714000000000",      // Debe estar PRESENTE
  senderId: "user-id-or-socket-id",   // Debe estar PRESENTE
  text: "Hola",                       // Debe estar PRESENTE
  timestamp: "2026-05-08T10:30:00.000Z"
}
```

### Viaje Emitido por Cliente
```javascript
{
  rideId: "ride-1714000000000",      // Debe estar PRESENTE
  passengerId: "user-id",             // Debe estar PRESENTE
  latitude: 12.345,                   // Debe estar PRESENTE
  longitude: -56.789,                 // Debe estar PRESENTE
  destination: {...},                 // Puede estar NULL
  estimatedPrice: 45                  // Puede estar NULL
}
```

### Cancelación Emitida por Cliente
```javascript
{
  rideId: "ride-1714000000000",      // Debe estar PRESENTE
  cancelledBy: "driver" || "passenger", // Debe estar PRESENTE
  userId: "user-id"                   // Puede estar NULL
}
```

---

## ✅ Checklist Final

Cuando todo funcione correctamente, debes ver:

- [ ] Servidor recibe `joinRide` evento
- [ ] Servidor recibe `newRideRequest` evento
- [ ] Base de datos tiene nuevo registro en tabla `rides`
- [ ] Conductor recibe `newRideRequest` en su app
- [ ] Conductor acepta viaje
- [ ] Servidor actualiza `rides.status = 'accepted'`
- [ ] Pasajero ve que viaje fue aceptado
- [ ] Ambos envían mensaje
- [ ] Servidor guarda mensaje en tabla `messages`
- [ ] Ambos reciben el mensaje (sin "transport error")
- [ ] Pasajero cancela viaje
- [ ] Servidor actualiza `rides.status = 'cancelled'`
- [ ] Ambos ven cancelación en sus apps

---

## 🚨 Qué Reportar

Si algo no funciona, copia estos logs:

1. **Del servidor**:
   ```
   [PEGA AQUÍ LOS LOGS DEL SERVIDOR]
   ```

2. **De la base de datos**:
   ```sql
   SELECT * FROM rides WHERE id LIKE 'ride-%' ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM messages WHERE ride_id LIKE 'ride-%' ORDER BY created_at DESC LIMIT 5;
   ```

3. **Del cliente** (mira la consola):
   ```
   [PEGA AQUÍ LOS LOGS DEL CLIENTE]
   ```

---

**Última actualización**: 8 de mayo de 2026

