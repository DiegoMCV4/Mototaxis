import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('passenger'); // 'passenger' o 'driver'
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Atención', 'Por favor llena todos los campos');
      return;
    }

    setIsLoading(true);
    const response = await register(fullName, email, password, userType);
    setIsLoading(false);

    if (!response.success) {
      Alert.alert('Error al registrar', response.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.bg }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Text style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>📝</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Crear <Text style={[styles.titleHighlight, { color: theme.primary }]}>Cuenta</Text></Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Únete a MotoTaxi</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.label, { color: theme.textMuted }]}>QUIERO REGISTRARME COMO</Text>
          <View style={[styles.roleSelector, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : '#F9FAFB', borderColor: theme.border }]}>
            <TouchableOpacity 
              style={[styles.roleBtn, userType === 'passenger' && [styles.roleBtnActive, { backgroundColor: theme.card }]]}
              onPress={() => setUserType('passenger')}
            >
              <Text style={[styles.roleText, { color: theme.textMuted }, userType === 'passenger' && [styles.roleTextActive, { color: theme.primary }]]}>
                Pasajero
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleBtn, userType === 'driver' && [styles.roleBtnActive, { backgroundColor: theme.card }]]}
              onPress={() => setUserType('driver')}
            >
              <Text style={[styles.roleText, { color: theme.textMuted }, userType === 'driver' && [styles.roleTextActive, { color: theme.primary }]]}>
                Conductor
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.textMuted }]}>NOMBRE COMPLETO</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : '#F9FAFB', color: theme.text, borderColor: theme.border }]} 
            placeholder="Ej. Juan Pérez" 
            placeholderTextColor={theme.textMuted}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <Text style={[styles.label, { color: theme.textMuted }]}>EMAIL</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : '#F9FAFB', color: theme.text, borderColor: theme.border }]} 
            placeholder="tu@email.com" 
            placeholderTextColor={theme.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[styles.label, { color: theme.textMuted }]}>CONTRASEÑA</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={[styles.input, styles.passwordInput, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : '#F9FAFB', color: theme.text, borderColor: theme.border }]} 
              placeholder="••••••" 
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeBtn} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={[styles.loginBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLinkContainer} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.registerLinkText, { color: theme.textMuted }]}>
              ¿Ya tienes cuenta? <Text style={[styles.registerLinkTextHighlight, { color: theme.primary }]}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  titleHighlight: {
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 1,
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleBtn: {
    flex: 0.5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  roleBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  roleText: {
    fontWeight: '600',
    fontSize: 14,
  },
  roleTextActive: {
  },
  input: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    fontSize: 15,
  },
  loginBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  registerLinkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 14,
  },
  registerLinkTextHighlight: {
    fontWeight: '700',
  },
  themeToggle: {
    position: 'absolute',
    top: -10,
    right: -10,
    padding: 10,
    zIndex: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeBtn: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
    zIndex: 10,
  }
});
