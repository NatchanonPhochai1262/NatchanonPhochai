import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './LoginScreen.styles';

// Import Firebase (Path ถูกต้องตามโครงสร้างโฟลเดอร์ของคุณ)
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useGoogleAuthRequest, signInWithGoogleResult } from '../utils/googleAuth';

// หน้าเข้าสู่ระบบด้วยอีเมล/รหัสผ่านหรือบัญชี Google
export default function LoginScreen({ navigation }) {
  // สถานะของฟอร์มและการเข้าสู่ระบบ: แก้ส่วนนี้เมื่อต้องเพิ่ม/เปลี่ยนข้อมูลที่ใช้ล็อกอิน
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [request, response, promptGoogleSignIn] = useGoogleAuthRequest();

  // แสดงกล่องแจ้งเตือนให้เหมาะกับแพลตฟอร์มเว็บหรือมือถือ
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน: ตรวจข้อมูล -> ตรวจบัญชีกับ Firebase -> แจ้งผล
  const handleLogin = async () => {
    const cleanEmail = email.trim();

    // ตรวจช่องว่างก่อนเรียก Firebase เพื่อแจ้งผู้ใช้ได้ตรงว่าขาดข้อมูลใด
    if (!cleanEmail && !password) {
      showAlert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (!cleanEmail) {
      showAlert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกอีเมล');
      return;
    }
    if (!password) {
      showAlert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกรหัสผ่าน');
      return;
    }

    // ส่งข้อมูลไปตรวจสอบบัญชีใน Firebase และแสดงสถานะกำลังโหลด
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      setLoading(false);

      showAlert('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${userCredential.user.email}`);
      // ไม่ต้อง navigate เอง: App.js สลับไปหน้า Home ให้อัตโนมัติผ่าน onAuthStateChanged

    } catch (error) {
      setLoading(false);
      console.log('Firebase Login Error:', error.code);

      // แปลงรหัสข้อผิดพลาดจาก Firebase เป็นข้อความที่ผู้ใช้เข้าใจได้
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          showAlert('เข้าสู่ระบบไม่สำเร็จ', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
          break;
        case 'auth/invalid-email':
          showAlert('รูปแบบไม่ถูกต้อง', 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง');
          break;
        default:
          showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง');
          break;
      }
    }
  };

  // เข้าสู่ระบบด้วย Google; ผู้ใช้ใหม่ไปกรอกข้อมูลโปรไฟล์ ส่วนผู้ใช้เดิมเข้าหน้าแรก
  const handleGoogleLogin = async () => {
    // มือถือต้องมีคำขอ Google Auth ที่พร้อมใช้งานก่อนเริ่มล็อกอิน
    if (Platform.OS !== 'web' && !request) {
      showAlert('ยังไม่พร้อมใช้งาน', 'กรุณาตั้งค่า Google Client ID ของแอปก่อน');
      return;
    }

    setLoading(true);
    try {
      const googleUser = await signInWithGoogleResult(response);
      if (googleUser) {
        // ผู้ใช้เดิมไปหน้าแรกผ่านสถานะ Auth; ผู้ใช้ใหม่ไปกรอกข้อมูลสมัครสมาชิกต่อ
        const profileSnapshot = await getDoc(doc(db, 'users', googleUser.uid));
        if (profileSnapshot.exists()) {
          // ไม่ต้อง navigate เอง: App.js สลับไปหน้า Home ให้อัตโนมัติผ่าน onAuthStateChanged
        } else {
          navigation?.navigate('RegisterStep2', {
            googleUser: true,
            fullName: googleUser.displayName || '',
            email: googleUser.email || '',
          });
        }
      }
    } catch (error) {
      console.log('Google Login Error:', error.code || error.message);
      showAlert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // รับผลลัพธ์จากหน้าต่าง Google Sign-In และจัดการสำเร็จ/ผิดพลาด/ยกเลิก
  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleLogin();
    } else if (response?.type === 'error') {
      setLoading(false);
      showAlert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setLoading(false);
    }
  }, [response]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
      {/* ช่วยเลื่อนฟอร์มและซ่อนคีย์บอร์ดให้เหมาะกับหน้าจอมือถือ */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ปุ่มย้อนกลับ */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#161C24" />
          </TouchableOpacity>

          {/* Header & Logo */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🥗</Text>
            </View>
            <Text style={styles.titleText}>
              แอปพลิเคชันบันทึกสมดุล{"\n"}
              แคลอรี่รายวัน<Text style={styles.titleDot}>.</Text>
            </Text>
            <Text style={styles.subtitleText}>เข้าสู่ระบบเพื่อบันทึกแคลอรี่</Text>
          </View>

          {/* ฟอร์มเข้าสู่ระบบ: ช่องอีเมล รหัสผ่าน และปุ่มลืมรหัสผ่าน */}
          <View style={styles.formContainer}>
            {/* Input อีเมล */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>อีเมล</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#C4CDD5"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Input รหัสผ่าน */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>รหัสผ่าน</Text>
              <TextInput
                style={styles.input}
                placeholder="........"
                placeholderTextColor="#C4CDD5"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* ปุ่ม ลืมรหัสผ่าน? */}
            <TouchableOpacity 
              style={styles.forgotButton} 
              onPress={() => navigation?.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
            </TouchableOpacity>

            {/* ปุ่มเข้าสู่ระบบด้วยอีเมล: เรียก handleLogin และแสดงตัวหมุนระหว่างโหลด */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>หรือ</Text>
              <View style={styles.divider} />
            </View>

            {/* ปุ่ม Google: เว็บเริ่มตรวจผลทันที ส่วนมือถือเปิดหน้าต่าง Google Sign-In */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => {
                if (Platform.OS === 'web') {
                  handleGoogleLogin();
                } else {
                  promptGoogleSignIn();
                }
              }}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>เข้าสู่ระบบด้วย Google</Text>
            </TouchableOpacity>

            {/* Footer สมัครสมาชิก */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>ยังไม่มีบัญชีใช่หรือไม่?</Text>
              <TouchableOpacity
                onPress={() => navigation?.navigate('RegisterStep1')}
                activeOpacity={0.7}
              >
                <Text style={styles.signUpText}>สมัครสมาชิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}