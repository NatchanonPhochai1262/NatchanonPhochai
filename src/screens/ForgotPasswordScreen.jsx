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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ForgotPasswordScreen.styles';

import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

// หน้าขอลิงก์ตั้งรหัสผ่านใหม่ผ่าน Firebase Authentication
export default function ForgotPasswordScreen({ navigation }) {
  // เก็บอีเมลที่ใช้ขอลิงก์รีเซ็ตรหัสผ่านและสถานะหน้าจอ
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // แสดงกล่องแจ้งเตือนให้เหมาะกับแพลตฟอร์มเว็บหรือมือถือ
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // จุดสาธิต: ลืมรหัสผ่าน ตรวจอีเมลก่อนเรียก Firebase Auth ส่งลิงก์เปลี่ยนรหัสผ่าน
  const handleResetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();

    // เช็กค่าว่าง
    if (!cleanEmail) {
      showAlert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกอีเมลของคุณ');
      return;
    }

    // เช็กรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      showAlert('รูปแบบไม่ถูกต้อง', 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง');
      return;
    }

    setLoading(true);

    try {
      // จุดสาธิตคำสั่ง: sendPasswordResetEmail ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมล
      await sendPasswordResetEmail(auth, cleanEmail);
      setLoading(false);
      setShowSuccessModal(true); // เปิด Modal สำเร็จแบบในรูป
    } catch (error) {
      setLoading(false);
      console.log('Reset Password Error:', error.code, error.message);

      if (error.code === 'auth/user-not-found') {
        showAlert('ไม่พบบัญชีผู้ใช้', 'ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีกครั้ง');
      } else if (error.code === 'auth/invalid-email') {
        showAlert('รูปแบบไม่ถูกต้อง', 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง');
      } else {
        showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถส่งลิงก์กู้คืนได้ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  // ปิดข้อความสำเร็จและกลับไปหน้าเข้าสู่ระบบ
  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    navigation?.goBack(); // กดยืนยันแล้วกลับหน้า Login
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FF5722" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>กู้คืนรหัสผ่าน</Text>
            <Text style={styles.subtitleText}>
              กรุณากรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะจัดส่งลิงก์สำหรับ{"\n"}
              ตั้งค่ารหัสผ่านใหม่ไปยังอีเมล
            </Text>
          </View>

          <View style={styles.formContainer}>
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

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleResetPassword}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>ส่งลิงก์กู้คืน</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal แจ้งเตือนสำเร็จตามรูปด้านล่าง */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalCard}>
            <Text style={styles.modalTitleText}>สำเร็จ</Text>
            <Text style={styles.modalSubtitleText}>
              ลิงก์กู้คืนรหัสผ่านถูกส่งไปยังอีเมลของคุณ{"\n"}แล้ว
            </Text>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={handleConfirmSuccess}
              activeOpacity={0.8}
            >
              <Text style={styles.modalConfirmButtonText}>ตกลง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}