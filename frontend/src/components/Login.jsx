import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useToast } from './Toast';

export default function Login({ onLogin, onRegister }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('passenger');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (isRegisterMode && !fullName)) {
      toast.warning('Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        await onRegister(email, password, fullName, userType, phone);
      } else {
        await onLogin(email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    // Limpiar campos extras al cambiar a login
    if (isRegisterMode) {
      setFullName('');
      setPhone('');
    }
  };

  // Demo credentials
  const fillDemoPassenger = () => {
    setIsRegisterMode(false);
    setEmail('passenger@demo.com');
    setPassword('password');
    setUserType('passenger');
    toast.info('Datos de pasajero demo cargados');
  };

  const fillDemoDriver = () => {
    setIsRegisterMode(false);
    setEmail('driver@demo.com');
    setPassword('password');
    setUserType('driver');
    toast.info('Datos de conductor demo cargados');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="bg-primary dark:bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-lg transition-colors">
            <span className="text-3xl text-white dark:text-primary">🏍️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">MotoTaxi</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isRegisterMode ? 'Crea tu cuenta ahora' : 'Tu app de transporte seguro y rápido'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 space-y-4 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">
            {isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}
          </h2>

          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Teléfono (opcional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +51 987654321"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email *</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Contraseña *</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10 text-sm"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tipo de Usuario</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUserType('passenger')}
                className={`py-2 px-1 rounded-lg font-semibold border-2 text-sm transition ${
                  userType === 'passenger'
                    ? 'border-primary bg-primary bg-opacity-10 text-primary dark:border-blue-500 dark:text-blue-400 dark:bg-blue-900 dark:bg-opacity-20'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary dark:hover:border-blue-500'
                }`}
              >
                👤 Pasajero
              </button>
              <button
                type="button"
                onClick={() => setUserType('driver')}
                className={`py-2 px-1 rounded-lg font-semibold border-2 text-sm transition ${
                  userType === 'driver'
                    ? 'border-primary bg-primary bg-opacity-10 text-primary dark:border-blue-500 dark:text-blue-400 dark:bg-blue-900 dark:bg-opacity-20'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary dark:hover:border-blue-500'
                }`}
              >
                🚗 Conductor
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-lg">⏳</span>
                {isRegisterMode ? 'Registrando...' : 'Ingresando...'}
              </>
            ) : (
              <>
                {isRegisterMode ? <UserPlus size={18} /> : <LogIn size={18} />}
                {isRegisterMode ? 'Crear Cuenta' : 'Ingresar'}
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary dark:text-blue-400 font-semibold text-sm hover:underline"
            >
              {isRegisterMode 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>

          {!isRegisterMode && (
            <>
              <div className="flex items-center gap-2 text-gray-400 text-xs py-1">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <span>DEMO</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={fillDemoPassenger}
                  className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  👤 Pasajero Demo
                </button>
                <button
                  type="button"
                  onClick={fillDemoDriver}
                  className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  🚗 Conductor Demo
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
