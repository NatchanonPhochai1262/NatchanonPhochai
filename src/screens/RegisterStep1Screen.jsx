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
import { styles } from './RegisterStep1Screen.styles';

// ขั้นที่ 1 ของการสมัคร: รับชื่อ อีเมล และรหัสผ่าน พร้อมตรวจสอบก่อนส่งต่อ
export default function RegisterStep1Screen({ navigation }) {
  // เก็บข้อมูลบัญชีชั่วคราวระหว่างขั้นตอนที่ 1; ยังไม่สร้างบัญชีจนกว่าจะกรอกข้อมูลขั้นถัดไปครบ
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // แสดงกล่องแจ้งเตือนให้เหมาะกับแพลตฟอร์มเว็บหรือมือถือ
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // ตรวจชื่อ อีเมล และรหัสผ่านก่อนส่งข้อมูลบัญชีไปหน้ากรอกข้อมูลร่างกาย
  const handleNextStep = async () => {
    const cleanEmail = email.trim().toLowerCase(); // ทำเป็นตัวพิมพ์เล็กเพื่อเทียบอีเมลได้แม่นยำ
    const cleanName = fullName.trim();

    // 1. เช็กค่าว่าง
    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      showAlert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }

    // 2. เช็กรูปแบบอีเมลด้วย Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      showAlert('รูปแบบไม่ถูกต้อง', 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง');
      return;
    }

    // 3. เช็กความยาวรหัสผ่าน
    if (password.length < 6) {
      showAlert('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    // 4. เช็กรหัสผ่านกับยืนยันรหัสผ่านตรงกันไหม
    if (password !== confirmPassword) {
      showAlert('รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบรหัสผ่านและยืนยันรหัสผ่านอีกครั้ง');
      return;
    }

    // จุดสาธิต: ขั้นนี้ตรวจข้อมูลเบื้องต้นและส่งค่าไป Step 2; ยังไม่สร้างบัญชีใน Firebase
    // Firebase Auth จะตรวจอีเมลซ้ำจริงตอนเรียก createUserWithEmailAndPassword ใน Step 2
    setLoading(true);
    setLoading(false);

    // ส่งข้อมูลบัญชีไป Step 2 เพื่อกรอกข้อมูลร่างกายและสร้างบัญชีจริง
    navigation?.navigate('RegisterStep2', {
      fullName: cleanName,
      email: cleanEmail,
      password,
    });
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
            <Text style={styles.titleText}>สร้างบัญชีผู้ใช้</Text>
            <Text style={styles.subtitleText}>
              ขั้นตอนที่ 1 จาก 2: กรอกข้อมูลส่วนตัว
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อ-นามสกุล</Text>
              <TextInput
                style={styles.input}
                placeholder="ระบุชื่อ-นามสกุล"
                placeholderTextColor="#C4CDD5"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>อีเมล</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#C4CDD5"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>รหัสผ่าน</Text>
              <View style={{ justifyContent: 'center' }}>
                <TextInput
                  style={styles.input}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  placeholderTextColor="#C4CDD5"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16 }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ยืนยันรหัสผ่าน</Text>
              <View style={{ justifyContent: 'center' }}>
                <TextInput
                  style={styles.input}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  placeholderTextColor="#C4CDD5"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16 }}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.nextButtonText}>ถัดไป</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}