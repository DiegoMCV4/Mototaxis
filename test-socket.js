#!/usr/bin/env node

/**
 * TEST RÁPIDO DE CONECTIVIDAD SOCKET.IO
 * Uso: node test-socket.js
 * 
 * Este script verifica que el servidor de tracking está funcionando
 * y acepta conexiones WebSocket.
 */

const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3004'; // Cambia a tu URL si es diferente

console.log(`\n🔍 Conectando a ${SERVER_URL}...\n`);

const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

let testsPassed = 0;
let testsFailed = 0;

// Test 1: Conexión inicial
socket.on('connect', () => {
  console.log('✅ TEST 1 PASÓ: Conectado al servidor');
  testsPassed++;
  
  // Test 2: Enviar joinRide
  console.log('\n🧪 TEST 2: Enviando joinRide...');
  socket.emit('joinRide', 'test-ride-123');
});

socket.on('error', (error) => {
  console.error('❌ ERROR DE CONEXIÓN:', error);
  testsFailed++;
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log(`\n⚠️ Desconectado: ${reason}`);\n  printResults();\n  process.exit(testsFailed > 0 ? 1 : 0);\n});

socket.on('connect_error', (error) => {\n  console.error('❌ Error de conexión WebSocket:', error.message);\n  testsFailed++;\n  process.exit(1);\n});

// Simular eventos del servidor\nsocket.on('driversUpdate', (data) => {\n  console.log('✅ TEST 3 PASÓ: Recibido driversUpdate');\n  testsPassed++;\n});\n\nsocket.on('newRideRequest', (data) => {\n  console.log('✅ TEST 4 PASÓ: Recibido newRideRequest');\n  testsPassed++;\n});\n\nsocket.on('newMessage', (data) => {\n  console.log('✅ TEST 5 PASÓ: Recibido newMessage');\n  testsPassed++;\n});\n\n// Esperar 5 segundos y desconectar\nsetTimeout(() => {\n  console.log('\\n📊 Cerrando conexión de prueba...');\n  socket.disconnect();\n}, 5000);\n\nfunction printResults() {\n  console.log('\\n' + '='.repeat(50));\n  console.log(`✅ PRUEBAS EXITOSAS: ${testsPassed}`);\n  console.log(`❌ PRUEBAS FALLIDAS: ${testsFailed}`);\n  console.log('='.repeat(50) + '\\n');\n  \n  if (testsFailed === 0) {\n    console.log('🎉 ¡Conectividad OK! El servidor está funcionando.');\n  } else {\n    console.log('⚠️  Hay problemas de conectividad.');\n  }\n}\n