const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MotoTaxi API Documentation',
      version: '1.0.0',
      description: 'Documentación centralizada de los microservicios de MotoTaxi (Auth, Rides, Ratings, Tracking, Payments)',
      contact: {
        name: 'Soporte MotoTaxi'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local (API Gateway)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      // --- AUTH SERVICE ---
      '/api/auth/register': {
        post: {
          tags: ['Auth Service'],
          summary: 'Registrar nuevo usuario',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                    fullName: { type: 'string' },
                    userType: { type: 'string', enum: ['passenger', 'driver'] },
                    phone: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Usuario registrado con éxito' },
            400: { description: 'Error en la petición' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth Service'],
          summary: 'Iniciar sesión',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Login exitoso' },
            401: { description: 'Credenciales inválidas' }
          }
        }
      },
      '/api/auth/verify': {
        get: {
          tags: ['Auth Service'],
          summary: 'Verificar token JWT',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Token válido' },
            401: { description: 'Token inválido' }
          }
        }
      },
      '/api/user/{id}': {
        get: {
          tags: ['Auth Service'],
          summary: 'Obtener perfil de usuario',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Perfil encontrado' },
            404: { description: 'Usuario no encontrado' }
          }
        },
        put: {
          tags: ['Auth Service'],
          summary: 'Actualizar perfil de usuario',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    fullName: { type: 'string' },
                    phone: { type: 'string' },
                    photo: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Perfil actualizado' }
          }
        }
      },

      // --- RIDES SERVICE ---
      '/api/rides/request': {
        post: {
          tags: ['Rides Service'],
          summary: 'Solicitar un viaje',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    pickupAddress: { type: 'string' },
                    destinationAddress: { type: 'string' },
                    pickupLat: { type: 'number' },
                    pickupLng: { type: 'number' },
                    destLat: { type: 'number' },
                    destLng: { type: 'number' },
                    estimatedPrice: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Viaje solicitado' }
          }
        }
      },
      '/api/rides/{id}/accept': {
        post: {
          tags: ['Rides Service'],
          summary: 'Aceptar un viaje (Conductor)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Viaje aceptado' }
          }
        }
      },
      '/api/rides/{id}/complete': {
        post: {
          tags: ['Rides Service'],
          summary: 'Completar un viaje',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Viaje completado' }
          }
        }
      },
      '/api/rides/available': {
        get: {
          tags: ['Rides Service'],
          summary: 'Listar viajes disponibles para conductores',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de viajes' }
          }
        }
      },

      // --- RATINGS SERVICE ---
      '/api/ratings': {
        post: {
          tags: ['Ratings Service'],
          summary: 'Crear una calificación para un viaje',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    rideId: { type: 'string' },
                    rating: { type: 'number', minimum: 1, maximum: 5 },
                    comment: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Calificación creada' }
          }
        }
      },
      '/api/ratings/{userId}': {
        get: {
          tags: ['Ratings Service'],
          summary: 'Obtener calificaciones de un usuario',
          parameters: [
            { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Lista de calificaciones' }
          }
        }
      },
      '/api/ratings/average/{userId}': {
        get: {
          tags: ['Ratings Service'],
          summary: 'Obtener promedio de calificación de un usuario',
          parameters: [
            { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Promedio retornado' }
          }
        }
      },

      // --- TRACKING SERVICE ---
      '/api/tracking/drivers/nearby': {
        get: {
          tags: ['Tracking Service'],
          summary: 'Obtener conductores cercanos',
          parameters: [
            { name: 'lat', in: 'query', schema: { type: 'number' } },
            { name: 'lng', in: 'query', schema: { type: 'number' } }
          ],
          responses: {
            200: { description: 'Lista de conductores' }
          }
        }
      },

      // --- PAYMENTS SERVICE ---
      '/api/payments/wallet/{userId}': {
        get: {
          tags: ['Payments Service'],
          summary: 'Obtener balance del wallet',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Balance retornado' }
          }
        }
      }
    }
  },
  apis: [], // No usamos anotaciones en archivos JS por ahora, definimos todo arriba
};

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpecs: specs
};
