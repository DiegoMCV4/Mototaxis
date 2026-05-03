class AuthController {
  constructor(authUseCases) {
    this.authUseCases = authUseCases;
  }

  async register(req, res) {
    try {
      const result = await this.authUseCases.register(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      console.error('Error en registro:', error.message);
      if (error.message === 'Todos los campos son requeridos' || error.message === 'El usuario ya existe') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async login(req, res) {
    try {
      const result = await this.authUseCases.login(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error en login:', error.message);
      if (error.message === 'Email y contraseña requeridos' || error.message === 'Credenciales inválidas') {
        const status = error.message === 'Credenciales inválidas' ? 401 : 400;
        return res.status(status).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getProfile(req, res) {
    try {
      const profile = await this.authUseCases.getProfile(req.params.id);
      res.json(profile);
    } catch (error) {
      console.error('Error obteniendo perfil:', error.message);
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async updateProfile(req, res) {
    try {
      const updatedProfile = await this.authUseCases.updateProfile(req.params.id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error actualizando perfil:', error.message);
      if (error.message === 'No hay campos para actualizar') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  verifyToken(req, res) {
    res.json({ valid: true, user: req.user });
  }
}

module.exports = AuthController;
