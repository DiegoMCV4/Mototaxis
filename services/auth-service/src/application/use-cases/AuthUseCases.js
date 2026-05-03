const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../../domain/models/User');

class AuthUseCases {
  constructor(userRepository, jwtSecret) {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
  }

  async register({ email, password, fullName, userType, phone }) {
    if (!email || !password || !fullName || !userType) {
      throw new Error('Todos los campos son requeridos');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const photo = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;

    const newUser = new User({
      id: userId,
      email,
      password: hashedPassword,
      fullName,
      userType,
      photo,
      phone
    });

    await this.userRepository.save(newUser);

    const token = jwt.sign({ id: userId, email, userType }, this.jwtSecret, { expiresIn: '7d' });

    // Remove password before returning
    const { password: _, ...userWithoutPassword } = newUser;
    return { token, user: userWithoutPassword };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email y contraseña requeridos');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.userType },
      this.jwtSecret,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async getProfile(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(id, { fullName, phone, photo }) {
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (photo) updates.photo = photo;

    if (Object.keys(updates).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    await this.userRepository.update(id, updates);
    return this.getProfile(id);
  }
}

module.exports = AuthUseCases;
