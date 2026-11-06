import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  useFonts,
  Kanit_400Regular,
  Kanit_500Medium,
  Kanit_600SemiBold,
  Kanit_700Bold,
} from '@expo-google-fonts/kanit';

// Firebase Auth
import { auth } from './src/config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

import HomeScreenGuest from './src/screens/HomeScreenGuest';
import LoginScreen from './src/screens/LoginScreen';
import RegisterStep1Screen from './src/screens/RegisterStep1Screen';
import RegisterStep2Screen from './src/screens/RegisterStep2Screen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import FoodScreen from './src/screens/FoodScreen';
import ExerciseScreen from './src/screens/ExerciseScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  // สถานะผู้ใช้กำหนดว่าจะเปิดกลุ่มหน้าสำหรับสมาชิกหรือผู้เยี่ยมชม
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // โหลดฟอนต์ก่อนแสดงแอป เพื่อป้องกันข้อความกระพริบหรือใช้ฟอนต์ไม่ตรงกัน
  const [fontsLoaded] = useFonts({
    Kanit_400Regular,
    Kanit_500Medium,
    Kanit_600SemiBold,
    Kanit_700Bold,
  });

  // จุดสาธิต: onAuthStateChanged ตรวจว่าล็อกอินอยู่หรือไม่ แล้วสลับกลุ่มหน้าสมาชิก/ผู้เยี่ยมชม
  // ฟังสถานะ Firebase Auth แบบต่อเนื่อง; เมื่อ Login/Logout จะเปลี่ยนกลุ่มหน้าตามผู้ใช้
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // รอทั้งฟอนต์และผลตรวจสถานะล็อกอินก่อนแสดง Navigator
  if (!fontsLoaded || initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F7FB' }}>
        <ActivityIndicator size="large" color="#FF5722" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // 🟢 กลุ่มหน้าของคนที่ล็อกอินแล้ว
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
            <Stack.Screen name="Food" component={FoodScreen} />
            <Stack.Screen name="Exercise" component={ExerciseScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </>
        ) : (
          // 🔴 กลุ่มหน้าของผู้เยี่ยมชม / ยังไม่ได้ล็อกอิน
          <>
            <Stack.Screen name="HomeScreenGuest" component={HomeScreenGuest} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
            <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}