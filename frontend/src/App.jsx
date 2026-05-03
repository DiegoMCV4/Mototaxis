import { useState, useEffect } from 'react';
import { authAPI } from './api';
import { socket } from './socket';
import { ToastProvider, useToast } from './components/Toast';
import Login from './components/Login';
import PassengerHome from './components/PassengerHome';
import DriverHome from './components/DriverHome';
import './App.css';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const toast = useToast();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    // Verificar sesión existente al cargar
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      // Verificar que el token siga siendo válido
      authAPI.verify()
        .then(() => {
          setUser(JSON.parse(savedUser));
        })
        .catch(() => {
          // Token expirado o inválido
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          toast.warning('Tu sesión expiró. Inicia sesión de nuevo.');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.data.success) {
        const userData = response.data.user;
        // Guardar token JWT y datos del usuario
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success(`¡Bienvenido, ${userData.fullName}!`);
      }
    } catch (error) {
      toast.error('Error al ingresar: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRegister = async (email, password, fullName, userType, phone) => {
    try {
      const response = await authAPI.register(email, password, fullName, userType, phone);

      if (response.data.success) {
        const userData = response.data.user;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success(`¡Cuenta creada! Bienvenido, ${userData.fullName}`);
      }
    } catch (error) {
      toast.error('Error al registrarse: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    socket.disconnect();
    socket.connect();
    toast.info('Sesión cerrada');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🏍️</div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold">Cargando MotoTaxi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {!user ? (
        <Login onLogin={handleLogin} onRegister={handleRegister} />
      ) : user.userType === 'passenger' ? (
        <PassengerHome user={user} onLogout={handleLogout} />
      ) : (
        <DriverHome user={user} onLogout={handleLogout} />
      )}

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform flex items-center justify-center w-12 h-12 text-xl"
        title="Cambiar tema"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
