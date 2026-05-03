import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mototaxi.app',
  appName: 'MotoTaxi',
  webDir: 'dist',
  server: {
    // En desarrollo, apuntar al API Gateway local
    // url: 'http://10.0.2.2:3000', // Android Emulator
    // En producción, quitar esta línea para usar el build estático
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: true,
      spinnerColor: '#e94560'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a2e'
    },
    Geolocation: {
      // Permisos de geolocalización necesarios para tracking
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
