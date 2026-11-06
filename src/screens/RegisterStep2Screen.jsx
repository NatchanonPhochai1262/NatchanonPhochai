import React, { useState, useEffect } from 'react';
import {
  BackHandler,
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
import { styles } from './RegisterStep2Screen.styles';

import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { activityLevels, calculateTDEEMifflin } from '../utils/helpers';

// ขั้นที่ 2 ของการสมัคร: รับข้อมูลร่างกาย คำนวณ TDEE และสร้างโปรไฟล์สมาชิก
export default function RegisterStep2Screen({ navigation, route }) {
  // รับข้อมูลบัญชีจาก Step 1 หรือข้อมูล Google; ใช้ร่วมกันในฟอร์มข้อมูลร่างกาย
  const params = route?.params || {};
  const password = params.password;
  // params อาจหายเมื่อ navigator สลับกลุ่มหน้าหลังล็อกอิน จึงดูจากผู้ใช้ที่ล็อกอินอยู่ด้วย
  const currentUser = auth.currentUser;
  const googleUser = !!params.googleUser || !!currentUser;
  const fullName = params.fullName || currentUser?.displayName || '';
  const email = params.email || currentUser?.email || '';

  // ผู้ใช้ Google ที่ยังไม่มีโปรไฟล์ ต้องออกจากระบบเมื่อย้อนกลับ ไม่ให้ข้ามไปหน้าแรก
  // ยกเลิกการสมัครด้วย Google โดยออกจาก Auth และกลับไปหน้า Login
  const leaveGoogleSignup = async () => {
    await signOut(auth);
    // หลังออกจากระบบ navigator สลับกลุ่มหน้า แต่ RegisterStep2 มีทั้งสองกลุ่มจึงค้างอยู่ ต้องพาไปหน้า Login เอง
    navigation?.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // กำหนดการย้อนกลับให้เหมาะกับการสมัครทั่วไปหรือสมัครผ่าน Google
  const handleBack = () => {
    if (googleUser) {
      leaveGoogleSignup();
    } else {
      navigation?.goBack();
    }
  };

  useEffect(() => {
    if (!googleUser) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      leaveGoogleSignup();
      return true;
    });
    return () => sub.remove();
  }, [googleUser]);

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('');

  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [calculatedTDEE, setCalculatedTDEE] = useState(0);
  const [loading, setLoading] = useState(false);

  const activityList = activityLevels;

  // แสดงกล่องแจ้งเตือนให้เหมาะกับแพลตฟอร์มเว็บหรือมือถือ
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // จุดสาธิต: สมัครสมาชิก ตรวจข้อมูลร่างกาย คำนวณ TDEE สร้างบัญชี Auth และบันทึกโปรไฟล์ Firestore
  // กรณีอีเมลซ้ำ ให้ค้นหา auth/email-already-in-use ใน catch ด้านล่าง
  const handleRegisterFinish = async () => {
    // 1. เช็คว่ากรอกครบทุกช่องไหม
    if (!age || !gender || !height || !weight || !activity) {
      showAlert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกและเลือกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }

    const numAge = parseFloat(age);
    const numHeight = parseFloat(height);
    const numWeight = parseFloat(weight);

    // 2. เช็คช่วงตัวเลขที่สมเหตุสมผล
    if (isNaN(numAge) || numAge < 1 || numAge > 120) {
      showAlert('ข้อมูลไม่ถูกต้อง', 'กรุณาระบุอายุในช่วง 1 - 120 ปี');
      return;
    }

    if (isNaN(numHeight) || numHeight < 50 || numHeight > 250) {
      showAlert('ข้อมูลไม่ถูกต้อง', 'กรุณาระบุส่วนสูงในช่วง 50 - 250 ซม.');
      return;
    }

    if (isNaN(numWeight) || numWeight < 20 || numWeight > 300) {
      showAlert('ข้อมูลไม่ถูกต้อง', 'กรุณาระบุน้ำหนักในช่วง 20 - 300 กก.');
      return;
    }

    // คำนวณ BMR & TDEE (Mifflin-St Jeor)
    const tdeeResult = calculateTDEEMifflin(gender, numAge, numHeight, numWeight, activity);
    setCalculatedTDEE(tdeeResult);

    setLoading(true);

    try {
      // จุดสาธิต: createUserWithEmailAndPassword สร้างบัญชีด้วยอีเมลและรหัสผ่าน
      // Google มีบัญชี Auth อยู่แล้ว จึงใช้ผู้ใช้ปัจจุบันแทนการสร้างบัญชีซ้ำ
      const user = googleUser
        ? auth.currentUser
        : (await createUserWithEmailAndPassword(auth, email ? email.trim() : '', password)).user;

      if (!user) {
        throw new Error('ไม่พบผู้ใช้ที่กำลังเข้าสู่ระบบ');
      }

      // จุดสาธิต: setDoc บันทึกโปรไฟล์ใน users/{uid} และผูกเอกสารกับบัญชี Firebase Auth
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: fullName || '',
        email: email ? email.trim() : '',
        age: numAge,
        gender: gender,
        height: numHeight,
        weight: numWeight,
        activity: activity,
        tdee: tdeeResult,
        createdAt: new Date().toISOString(),
        authProvider: googleUser ? 'google.com' : 'password',
      });

      setLoading(false);
      setShowSuccessModal(true);

    } catch (error) {
      setLoading(false);
      console.log('Firebase Register Error:', error.code);

      // จุดสาธิต: Firebase ส่ง error นี้กลับมาเมื่ออีเมลสมัครไว้แล้ว จึงแจ้งให้ใช้บัญชีเดิม/อีเมลอื่น
      if (error.code === 'auth/email-already-in-use') {
        if (Platform.OS === 'web') {
          alert('อีเมลนี้ถูกใช้งานแล้ว: กรุณาใช้อีเมลอื่น หรือกดเข้าสู่ระบบ');
          navigation?.navigate('Login');
        } else {
          Alert.alert(
            'อีเมลนี้ถูกใช้งานแล้ว',
            'อีเมลนี้มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่น หรือกดเข้าสู่ระบบ',
            [
              { text: 'ลองใหม่อีกครั้ง', style: 'cancel' },
              { text: 'เข้าสู่ระบบ', onPress: () => navigation?.navigate('Login') },
            ]
          );
        }
      } else if (error.code === 'auth/invalid-email') {
        showAlert('รูปแบบไม่ถูกต้อง', 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง');
      } else {
        showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  // 💡 ฟังก์ชันที่แก้ปัญหาการเด้งไปหน้าหลัก
  // ปิดข้อความสมัครสำเร็จและเริ่ม navigation ใหม่ที่หน้า Home
  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }], // ล้างสแต็คหน้าสมัคร แล้วพาเข้าหน้า Home ทันที
      });
    }
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
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FF5722" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>ข้อมูลร่างกาย</Text>
            <Text style={styles.subtitleText}>
              ขั้นตอนที่ 2 จาก 2: เพื่อคำนวณ TDEE ของคุณ
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>อายุ (ปี)</Text>
              <TextInput
                style={styles.input}
                placeholder="ระบุอายุของคุณ"
                placeholderTextColor="#C4CDD5"
                keyboardType="numeric"
                maxLength={3}
                value={age}
                onChangeText={setAge}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>เพศ</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowGenderModal(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectButtonText, !gender && styles.placeholderText]}>
                  {gender || 'เลือกเพศ'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.rowGroup}>
              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>ส่วนสูง (ซม.)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ระบุส่วนสูง"
                  placeholderTextColor="#C4CDD5"
                  keyboardType="numeric"
                  maxLength={3}
                  value={height}
                  onChangeText={setHeight}
                />
              </View>

              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>น้ำหนัก (กก.)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ระบุน้ำหนัก"
                  placeholderTextColor="#C4CDD5"
                  keyboardType="numeric"
                  maxLength={3}
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ระดับกิจกรรม</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowActivityModal(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.selectButtonText, !activity && styles.placeholderText]}
                  numberOfLines={1}
                >
                  {activity || 'กรุณาเลือกระดับกิจกรรม'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRegisterFinish}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>เสร็จสิ้นการสมัคร</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal แจ้งผล TDEE */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalCard}>
            <Text style={styles.modalTitleText}>สมัครสมาชิกสำเร็จ</Text>
            <Text style={styles.modalSubtitleText}>
              เป้าหมายพลังงาน (TDEE) ของคุณคือ{"\n"}
              <Text style={styles.modalTdeeHighlight}>
                {calculatedTDEE} kcal
              </Text>
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

      {/* Modal เลือกเพศ */}
      <Modal visible={showGenderModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderModal(false)}
        >
          <View style={styles.pickerModalCard}>
            {['ชาย', 'หญิง'].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.optionItem}
                onPress={() => {
                  setGender(item);
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal เลือกระดับกิจกรรม */}
      <Modal visible={showActivityModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActivityModal(false)}
        >
          <View style={styles.pickerModalCard}>
            {activityList.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.optionItem}
                onPress={() => {
                  setActivity(item);
                  setShowActivityModal(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}