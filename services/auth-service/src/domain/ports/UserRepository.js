// Interfaz / Puerto
// Define los métodos que cualquier implementación de base de datos debe cumplir.
class UserRepository {
  async findByEmail(email) {
    throw new Error('NOT_IMPLEMENTED');
  }

  async findById(id) {
    throw new Error('NOT_IMPLEMENTED');
  }

  async save(user) {
    throw new Error('NOT_IMPLEMENTED');
  }

  async update(id, updates) {
    throw new Error('NOT_IMPLEMENTED');
  }
}

module.exports = UserRepository;
