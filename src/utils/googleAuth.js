import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

// Client ID แยกตามแพลตฟอร์มและอ่านจาก environment variables
export const googleClientIds = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};

// เตรียมคำขอ OAuth สำหรับ Google Sign-In บนมือถือ
export function useGoogleAuthRequest() {
  // เตรียมคำขอ OAuth บนมือถือ; เว็บใช้ Firebase Popup ในฟังก์ชันด้านล่าง
  return Google.useAuthRequest({
    // Web uses Firebase signInWithPopup, but expo-auth-session still
    // validates this option while the Login screen is rendered.
    webClientId: googleClientIds.webClientId || 'web-client-placeholder.apps.googleusercontent.com',
    androidClientId: googleClientIds.androidClientId || 'android-client-placeholder.apps.googleusercontent.com',
    iosClientId: googleClientIds.iosClientId || 'ios-client-placeholder.apps.googleusercontent.com',
  });
}

// แลกผล Google Sign-In เป็นผู้ใช้ Firebase Auth; เว็บใช้ popup ส่วนมือถือใช้ idToken
export async function signInWithGoogleResult(response) {
  // เว็บและมือถือแลกเปลี่ยนข้อมูล Google กับ Firebase Auth คนละวิธี
  if (Platform.OS === 'web') {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return result.user;
  }

  if (response?.type !== 'success' || !response.authentication?.idToken) {
    return null;
  }

  const credential = GoogleAuthProvider.credential(response.authentication.idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}
