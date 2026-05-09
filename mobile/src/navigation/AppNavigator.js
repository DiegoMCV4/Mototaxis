import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PassengerDashboard from '../screens/PassengerDashboard';
import DriverDashboard from '../screens/DriverDashboard';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isDarkMode } = useContext(ThemeContext);
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null; // O un splash screen
  }

  return (
    <NavigationContainer theme={isDarkMode ? NavDarkTheme : DefaultTheme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
      >
        {user ? (
          user.userType === 'driver' ? (
            <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
          ) : (
            <Stack.Screen name="PassengerDashboard" component={PassengerDashboard} />
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
