import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// อ่านค่าการเชื่อมต่อ Firebase จาก environment variables ของ Vite
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!config.apiKey || !config.projectId) {
  throw new Error('Missing Firebase environment variables. Copy .env.example to .env.');
}

// สร้าง Firebase app และส่ง Auth/Firestore instance ให้ส่วนอื่นของ Admin ใช้ร่วมกัน
const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
