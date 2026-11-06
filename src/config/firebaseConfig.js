import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAXD2c9J5hBU_XTr8Rilp0jsor2wecPdds",
  authDomain: "calorieapp1-c2ce3.firebaseapp.com",
  projectId: "calorieapp1-c2ce3",
  storageBucket: "calorieapp1-c2ce3.firebasestorage.app",
  messagingSenderId: "129667179129",
  appId: "1:129667179129:web:903f812d45a36f63beaa8"
};

// จุดสาธิต: firebaseConfig คือข้อมูลโปรเจกต์ Firebase ที่แอปใช้เชื่อมต่อ
// เริ่ม Firebase App เพียงครั้งเดียว; รองรับกรณี Fast Refresh เรียกไฟล์ซ้ำระหว่างพัฒนา
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// จุดสาธิต: Firebase Authentication ใช้จัดการบัญชีและคงสถานะล็อกอินบนมือถือ
// ใช้ AsyncStorage เก็บสถานะล็อกอินบนมือถือ; หาก Auth ถูกสร้างไว้แล้วให้ใช้ instance เดิม
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

// จุดสาธิต: Firestore เป็นฐานข้อมูลที่หน้าจอใช้บันทึก/อ่านข้อมูล
// สร้าง Firestore instance ที่ใช้ร่วมกันในทุกหน้าของแอป
const db = getFirestore(app);

export { app, auth, db };