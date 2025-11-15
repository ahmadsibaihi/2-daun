import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LaunchScreen from './screens/LaunchScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import PlantHealthDetailScreen from './screens/PlantHealthDetailScreen';
import BlankScreen from './screens/BlankScreen';
import HydroMonitorScreen from './screens/HydroMonitorScreen';

import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { colors } from './theme';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0e4a2c',
        tabBarStyle: { height: 60 },
        tabBarIcon: ({ color }) => {
          const iconMap = {
            Home: 'home',
            Control: 'settings-outline',
            Logs: 'document-text-outline',
            Profile: 'person-circle-outline',
          };
          return <Ionicons name={iconMap[route.name]} size={22} color={color} />;
        },
        tabBarLabelStyle: { marginBottom: 6 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Control" component={BlankScreen} />
      <Tab.Screen name="Logs" component={BlankScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null; // keep splash while fonts load
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName="Launch" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Launch" component={LaunchScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="PlantHealthDetail" component={PlantHealthDetailScreen} />
        <Stack.Screen name="HydroMonitor" component={HydroMonitorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
