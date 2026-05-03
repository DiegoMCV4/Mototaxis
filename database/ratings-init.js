// =============================================
// MotoTaxi — Ratings Service (MongoDB)
// Base de datos: mototaxi_ratings
// Motor: MongoDB 7.0
// Script de inicialización (ejecutar con mongosh)
// Uso: mongosh mongodb://localhost:27017 ratings-init.js
// =============================================

// Conectar a la base de datos del ratings-service
db = db.getSiblingDB('mototaxi_ratings');

// ==================== COLECCIÓN: ratings ====================
db.createCollection('ratings', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['rideId', 'raterId', 'ratedId', 'score'],
      properties: {
        rideId:    { bsonType: 'string', description: 'ID del viaje calificado' },
        raterId:   { bsonType: 'string', description: 'Usuario que califica' },
        ratedId:   { bsonType: 'string', description: 'Usuario calificado' },
        score:     { bsonType: 'int', minimum: 1, maximum: 5 },
        comment:   { bsonType: 'string' },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

// ==================== ÍNDICES ====================
db.ratings.createIndex({ ratedId: 1 });
db.ratings.createIndex({ raterId: 1 });
db.ratings.createIndex({ rideId: 1 });
db.ratings.createIndex({ createdAt: -1 });

// ==================== DATOS DE PRUEBA ====================
db.ratings.insertMany([
  {
    rideId:    'demo-ride-001',
    raterId:   'demo-passenger-001',
    ratedId:   'demo-driver-001',
    score:     5,
    comment:   'Excelente conductor, muy puntual.',
    createdAt: new Date()
  },
  {
    rideId:    'demo-ride-002',
    raterId:   'demo-driver-001',
    ratedId:   'demo-passenger-001',
    score:     5,
    comment:   'Pasajero respetuoso.',
    createdAt: new Date()
  }
]);

print('✅ mototaxi_ratings inicializado con MongoDB');
print('   Colecciones: ratings');
print('   Índices creados: ratedId, raterId, rideId, createdAt');
