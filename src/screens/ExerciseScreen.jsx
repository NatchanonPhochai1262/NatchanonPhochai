import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ExerciseScreen.styles';

// Import Firestore และ Auth
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// หน้ากรอกและบันทึกข้อมูลกิจกรรมออกกำลังกายของสมาชิก
export default function ExerciseScreen({ navigation }) {
  // State สำหรับฟอร์มกรอกข้อมูล
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('คาร์ดิโอ');

  // State สำหรับ Modals และ Loading
  const [selectedDate, setSelectedDate] = useState({ label: 'วันนี้', value: new Date() });
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories = ['คาร์ดิโอ', 'เวทเทรนนิ่ง', 'กีฬา', 'ยืดเหยียด', 'กิจกรรมทั่วไป'];

  // สร้างตัวเลือกวันที่ย้อนหลัง 14 วันสำหรับกำหนดวันของกิจกรรม
  const generateDateOptions = () => {
    const options = [];
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      let label = '';
      if (i === 0) label = 'วันนี้';
      else if (i === 1) label = 'เมื่อวาน';
      else label = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;

      options.push({ label, value: d });
    }
    return options;
  };

  const dateOptions = generateDateOptions();

  // แสดงกล่องแจ้งเตือนให้เหมาะกับแพลตฟอร์มเว็บหรือมือถือ
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') alert(`${title}: ${message}`);
    else Alert.alert(title, message);
  };

  // 💾 ตรวจข้อมูลแล้วเพิ่มบันทึกการออกกำลังกายลง collection ของสมาชิกที่ล็อกอิน
  const handleSaveExercise = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showAlert('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนทำการบันทึกข้อมูล');
      return;
    }

    if (!activityName.trim()) {
      showAlert('แจ้งเตือน', 'กรุณากรอกชื่อกิจกรรม');
      return;
    }

    if (!calories || isNaN(calories) || Number(calories) <= 0) {
      showAlert('แจ้งเตือน', 'กรุณากรอกจำนวนแคลอรี่ให้ถูกต้อง');
      return;
    }

    setIsSaving(true);

    try {
      // จัดรูปวันที่ตามเวลาท้องถิ่นเพื่อให้หน้าแรกและประวัติค้นหาวันเดียวกันได้
      const targetDate = new Date(selectedDate.value);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const formattedDuration = duration.trim() ? `${duration.trim()} นาที` : null;

      await addDoc(collection(db, 'users', currentUser.uid, 'exerciseLogs'), {
        exerciseName: activityName.trim(),
        durationMinutes: duration.trim() ? Number(duration) : null,
        durationText: formattedDuration,
        calories: Number(calories),
        category: selectedCategory,
        loggedDate: dateString,
        source: 'smartwatch_or_app',
        createdAt: serverTimestamp(),
      });

      setIsSaving(false);
      showAlert('บันทึกสำเร็จ', `บันทึกกิจกรรม "${activityName.trim()}" (${calories} kcal) เรียบร้อยแล้ว`);

      // ล้างข้อมูลในฟอร์ม
      setActivityName('');
      setDuration('');
      setCalories('');
    } catch (error) {
      setIsSaving(false);
      console.log('Error saving exercise log:', error);
      showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.titleText}>บันทึกการออกกำลังกาย</Text>
              <Text style={styles.subtitleText}>บันทึกผลการเผาผลาญแคลอรี่จากกิจกรรมของคุณ</Text>
            </View>

            {/* ⌚️ Banner แจ้งเตือนเรื่อง Smart Watch / App */}
            <View
              style={{
                backgroundColor: '#FFF4E5',
                borderWidth: 1,
                borderColor: '#FFE0B2',
                borderRadius: 16,
                padding: 14,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 12 }}>⌚️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Kanit_600SemiBold', fontSize: 14, color: '#B76E00', marginBottom: 2 }}>
                  คำแนะนำการบันทึก
                </Text>
                <Text style={{ fontFamily: 'Kanit_400Regular', fontSize: 13, color: '#B76E00', lineHeight: 18 }}>
                  กรุณานำข้อมูลกิจกรรม เวลา และแคลอรี่ มาจาก Smart Watch หรือแอปออกกำลังกายในมือถือ
                </Text>
              </View>
            </View>

            {/* เลือกวันที่ */}
            <View style={styles.dateSelectorCard}>
              <View style={styles.dateSelectorLeft}>
                <Text style={{ fontSize: 16 }}>📅</Text>
                <Text style={styles.dateSelectorLabel}>เลือกวันที่บันทึก:</Text>
              </View>
              <TouchableOpacity
                style={styles.dateDropdownButton}
                onPress={() => setIsDateModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateDropdownText}>{selectedDate.label}</Text>
                <Ionicons name="caret-down" size={14} color="#FF5722" />
              </TouchableOpacity>
            </View>

            {/* 📝 ฟอร์มกรอกข้อมูลการออกกำลังกาย */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
                marginTop: 8,
              }}
            >
              <Text style={{ fontFamily: 'Kanit_600SemiBold', fontSize: 17, color: '#161C24', marginBottom: 16 }}>
                🏃 ข้อมูลกิจกรรม
              </Text>

              {/* ชื่อกิจกรรม */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontFamily: 'Kanit_500Medium', fontSize: 14, color: '#454F5B', marginBottom: 6 }}>
                  ชื่อกิจกรรม / กีฬา <Text style={{ color: '#FF5722' }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    backgroundColor: '#F4F6F8',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontFamily: 'Kanit_400Regular',
                    fontSize: 15,
                    color: '#161C24',
                  }}
                  placeholder="เช่น วิ่งกลางแจ้ง, ตีแบดมินตัน, ปั่นจักรยาน"
                  placeholderTextColor="#919EAB"
                  value={activityName}
                  onChangeText={setActivityName}
                />
              </View>

              {/* เวลา และ แคลอรี่ */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                {/* เวลา */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Kanit_500Medium', fontSize: 14, color: '#454F5B', marginBottom: 6 }}>
                    ระยะเวลา (นาที)
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#F4F6F8',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontFamily: 'Kanit_400Regular',
                      fontSize: 15,
                      color: '#161C24',
                    }}
                    placeholder="เช่น 45"
                    placeholderTextColor="#919EAB"
                    keyboardType="numeric"
                    value={duration}
                    onChangeText={setDuration}
                  />
                </View>

                {/* แคลอรี่ */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Kanit_500Medium', fontSize: 14, color: '#454F5B', marginBottom: 6 }}>
                    เผาผลาญ (kcal) <Text style={{ color: '#FF5722' }}>*</Text>
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#F4F6F8',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontFamily: 'Kanit_400Regular',
                      fontSize: 15,
                      color: '#161C24',
                    }}
                    placeholder="เช่น 320"
                    placeholderTextColor="#919EAB"
                    keyboardType="numeric"
                    value={calories}
                    onChangeText={setCalories}
                  />
                </View>
              </View>

              {/* เลือกหมวดหมู่ */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontFamily: 'Kanit_500Medium', fontSize: 14, color: '#454F5B', marginBottom: 8 }}>
                  หมวดหมู่กิจกรรม
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        selectedCategory === cat && styles.categoryChipActive,
                        { paddingHorizontal: 14, paddingVertical: 8 },
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive, { fontSize: 13 }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* ปุ่มบันทึก */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#FF5722',
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  shadowColor: '#FF5722',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleSaveExercise}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFFFFF', fontFamily: 'Kanit_600SemiBold', fontSize: 16 }}>
                      บันทึกการออกกำลังกาย
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('Home')} activeOpacity={0.7}>
          <Ionicons name="bar-chart-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>หน้าแรก</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('History')} activeOpacity={0.7}>
          <Ionicons name="calculator-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>ประวัติ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.plusButtonOuter} activeOpacity={0.85} onPress={() => setIsActionModalVisible(true)}>
          <View style={styles.plusButtonInner}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('Food')} activeOpacity={0.7}>
          <Ionicons name="fast-food-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>อาหาร</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('Profile')} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>โปรไฟล์</Text>
        </TouchableOpacity>
      </View>

      {/* Modal เลือกวันที่ */}
      <Modal visible={isDateModalVisible} transparent animationType="none">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsDateModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.dateModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>เลือกวันที่บันทึก</Text>
              <TouchableOpacity onPress={() => setIsDateModalVisible(false)}>
                <Ionicons name="close" size={22} color="#919EAB" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {dateOptions.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dateOptionItem, selectedDate.label === item.label && styles.dateOptionItemSelected]}
                  onPress={() => {
                    setSelectedDate(item);
                    setIsDateModalVisible(false);
                  }}
                >
                  <Text style={[styles.dateOptionText, selectedDate.label === item.label && styles.dateOptionTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal ปุ่ม + ด้านล่าง */}
      <Modal visible={isActionModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsActionModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsActionModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: '#FFF', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%' }}>
                <Text style={{ fontSize: 18, fontFamily: 'Kanit_700Bold', color: '#161C24', marginBottom: 16, textAlign: 'center' }}>
                  เลือกรายการที่ต้องการบันทึก
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#FFF0ED', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                  activeOpacity={0.8}
                  onPress={() => {
                    setIsActionModalVisible(false);
                    navigation?.navigate('Food');
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>🍔</Text>
                  <Text style={{ fontSize: 16, fontFamily: 'Kanit_600SemiBold', color: '#FF5722' }}>บันทึกอาหาร</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ backgroundColor: '#E8F5E9', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}
                  activeOpacity={0.8}
                  onPress={() => {
                    setIsActionModalVisible(false);
                    navigation?.navigate('Exercise');
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>🏃</Text>
                  <Text style={{ fontSize: 16, fontFamily: 'Kanit_600SemiBold', color: '#2E7D32' }}>บันทึกการออกกำลังกาย</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}