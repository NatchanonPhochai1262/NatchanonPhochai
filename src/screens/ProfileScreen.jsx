import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ProfileScreen.styles';

// Import Firestore & Auth
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { activityLevels, calculateTDEEMifflin } from '../utils/helpers';

// หน้าโปรไฟล์สำหรับดู/แก้ข้อมูลร่างกาย คำนวณ TDEE ใหม่ และออกจากระบบ
export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);

  // ✏️ แก้ไขข้อมูลส่วนตัว (อายุ / ส่วนสูง / น้ำหนัก / ระดับกิจกรรม)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editAge, setEditAge] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editActivity, setEditActivity] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // แสดงกล่องแจ้งเตือนให้เหมาะกับแพลตฟอร์มเว็บหรือมือถือ
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // 📥 ดึงข้อมูลโปรไฟล์จาก Firestore
  useEffect(() => {
    // โหลดเอกสาร users/{uid} ของสมาชิกปัจจุบันจาก Firestore
    const fetchUserProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          }
        }
      } catch (error) {
        console.log('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // 🖊️ เปิด modal แก้ไขข้อมูลส่วนตัว โดยดึงค่าปัจจุบันมาใส่ในฟอร์ม
  const handleOpenEditModal = () => {
    setEditAge(userData?.age ? String(userData.age) : '');
    setEditHeight(userData?.height ? String(userData.height) : '');
    setEditWeight(userData?.weight ? String(userData.weight) : '');
    setEditActivity(userData?.activity || '');
    setIsEditModalVisible(true);
  };

  // จุดสาธิต: แก้ข้อมูลโปรไฟล์ ตรวจค่าที่กรอก คำนวณ TDEE ใหม่ แล้วอัปเดต Firestore
  const handleSaveProfile = async () => {
    if (!editAge || !editHeight || !editWeight || !editActivity) {
      showAlert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกและเลือกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }

    const numAge = parseFloat(editAge);
    const numHeight = parseFloat(editHeight);
    const numWeight = parseFloat(editWeight);

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

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // 🔢 คำนวณ TDEE ใหม่ให้เหมาะสมกับข้อมูลร่างกายที่แก้ไข
    const newTdee = calculateTDEEMifflin(
      userData?.gender,
      numAge,
      numHeight,
      numWeight,
      editActivity
    );

    setSavingProfile(true);
    try {
      // จุดสาธิตคำสั่ง: updateDoc แก้เฉพาะฟิลด์ที่ส่งให้ โดยไม่เขียนทับเอกสารโปรไฟล์ทั้งหมด
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        age: numAge,
        height: numHeight,
        weight: numWeight,
        activity: editActivity,
        tdee: newTdee,
      });

      // อัปเดตข้อมูลในหน้าจอทันทีโดยไม่ต้องโหลดใหม่
      setUserData((prev) => ({
        ...prev,
        age: numAge,
        height: numHeight,
        weight: numWeight,
        activity: editActivity,
        tdee: newTdee,
      }));

      setIsEditModalVisible(false);
      showAlert('บันทึกสำเร็จ', `เป้าหมายพลังงานใหม่ของคุณคือ ${newTdee} kcal`);
    } catch (error) {
      console.log('Error updating profile:', error);
      showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSavingProfile(false);
    }
  };

  // ออกจาก Firebase Auth; App.js จะสังเกตสถานะและเปลี่ยนกลับไปกลุ่มหน้า Guest/Login
  const handleLogout = async () => {
    try {
      setIsLogoutModalVisible(false);
      await signOut(auth);
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  return (
    // 🟢 ครอบด้วย View หลัก เพื่อให้ Bottom Tab Bar วางตำแหน่ง absolute ได้เป๊ะเท่ากันทุกหน้า
    <View style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            {/* Header */}
            <Text style={styles.headerTitle}>โปรไฟล์</Text>

            {/* 👤 Card 1: การ์ดโปรไฟล์ส่วนตัว */}
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={44} color="#FFFFFF" />
                </View>
              </View>

              {loading ? (
                <ActivityIndicator size="small" color="#FF5722" style={{ marginVertical: 12 }} />
              ) : (
                <>
                  <Text style={styles.userNameText}>
                    {userData?.fullName || userData?.name || '-'}
                  </Text>
                  <Text style={styles.userGoalText}>
                    เป้าหมายพลังงาน:{' '}
                    <Text style={styles.goalHighlightText}>
                      {userData?.tdee || 0}
                    </Text>{' '}
                    kcal
                  </Text>
                </>
              )}
            </View>

            {/* 📊 Section 2: ข้อมูลสรีระร่างกาย */}
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>ข้อมูลสรีระร่างกาย</Text>
              {!loading && (
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={handleOpenEditModal}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color="#FF5722" />
                  <Text style={styles.editIconButtonText}>แก้ไข</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.statsCard}>
              {loading ? (
                <ActivityIndicator size="small" color="#FF5722" style={{ paddingVertical: 20 }} />
              ) : (
                <>
                  {/* อายุ */}
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>อายุ</Text>
                    <Text style={styles.statValue}>
                      {userData?.age ? `${userData.age} ปี` : '-'}
                    </Text>
                  </View>

                  <View style={styles.rowDivider} />

                  {/* เพศ */}
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>เพศ</Text>
                    <Text style={styles.statValue}>
                      {userData?.gender || '-'}
                    </Text>
                  </View>

                  <View style={styles.rowDivider} />

                  {/* ส่วนสูง */}
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>ส่วนสูง</Text>
                    <Text style={styles.statValue}>
                      {userData?.height ? `${userData.height} ซม.` : '-'}
                    </Text>
                  </View>

                  <View style={styles.rowDivider} />

                  {/* น้ำหนัก */}
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>น้ำหนัก</Text>
                    <Text style={styles.statValue}>
                      {userData?.weight ? `${userData.weight} กก.` : '-'}
                    </Text>
                  </View>

                  <View style={styles.rowDivider} />

                  {/* ระดับกิจกรรม */}
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>ระดับกิจกรรม</Text>
                    <Text style={[styles.statValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                      {userData?.activity || '-'}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* 🔴 ปุ่มออกจากระบบ */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => setIsLogoutModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 🧭 Bottom Navigation Bar (อยู่นอก SafeAreaView เพื่อไม่ให้โดนดันขอบล่าง) */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation?.navigate('Home')}>
          <Ionicons name="bar-chart-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>หน้าแรก</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation?.navigate('History')}>
          <Ionicons name="calculator-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>ประวัติ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.plusButtonOuter} activeOpacity={0.85} onPress={() => setIsActionModalVisible(true)}>
          <View style={styles.plusButtonInner}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation?.navigate('Food')}>
          <Ionicons name="fast-food-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>อาหาร</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Ionicons name="person" size={22} color="#FF5722" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>โปรไฟล์</Text>
        </TouchableOpacity>
      </View>

      {/* 🚨 Modal ยืนยันการออกจากระบบ (ใช้ styles.modalOverlay เดิม เพื่อให้อยู่ตรงกลาง) */}
      <Modal visible={isLogoutModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalCard}>
            <Text style={styles.confirmModalTitle}>ยืนยัน</Text>
            <Text style={styles.confirmModalDesc}>คุณต้องการออกจากระบบใช่หรือไม่?</Text>

            <View style={styles.confirmModalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsLogoutModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmBtn} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={styles.confirmBtnText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ➕ Modal ปุ่มบวกด้านล่าง (ขนาดเต็มขอบเป๊ะ ชิดซ้าย-ขวา เท่ากันทุกหน้า) */}
      <Modal visible={isActionModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsActionModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsActionModalVisible(false)}>
          {/* 🎯 กำหนด style เองแบบเต็มพื้นที่เพื่อไม่ให้ติด padding ขอบข้างจาก styles.modalOverlay */}
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
            <TouchableWithoutFeedback>
              <View 
                style={{ 
                  backgroundColor: '#FFF', 
                  paddingHorizontal: 20, 
                  paddingTop: 20, 
                  paddingBottom: 28, 
                  borderTopLeftRadius: 24, 
                  borderTopRightRadius: 24, 
                  width: '100%' 
                }}
              >
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

      {/* ✏️ Modal แก้ไขข้อมูลส่วนตัว */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalCard}>
            <Text style={styles.confirmModalTitle}>แก้ไขข้อมูลส่วนตัว</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380, width: '100%' }}>
              <View style={styles.editInputGroup}>
                <Text style={styles.editInputLabel}>อายุ (ปี)</Text>
                <TextInput
                  style={styles.editInput}
                  placeholder="ระบุอายุของคุณ"
                  placeholderTextColor="#C4CDD5"
                  keyboardType="numeric"
                  maxLength={3}
                  value={editAge}
                  onChangeText={setEditAge}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editInputLabel}>ส่วนสูง (ซม.)</Text>
                <TextInput
                  style={styles.editInput}
                  placeholder="ระบุส่วนสูง"
                  placeholderTextColor="#C4CDD5"
                  keyboardType="numeric"
                  maxLength={3}
                  value={editHeight}
                  onChangeText={setEditHeight}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editInputLabel}>น้ำหนัก (กก.)</Text>
                <TextInput
                  style={styles.editInput}
                  placeholder="ระบุน้ำหนัก"
                  placeholderTextColor="#C4CDD5"
                  keyboardType="numeric"
                  maxLength={3}
                  value={editWeight}
                  onChangeText={setEditWeight}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editInputLabel}>ระดับกิจกรรม</Text>
                <TouchableOpacity
                  style={styles.editSelectButton}
                  onPress={() => setShowActivityModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editSelectButtonText} numberOfLines={2}>
                    {editActivity || 'กรุณาเลือกระดับกิจกรรม'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.confirmModalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditModalVisible(false)}
                activeOpacity={0.8}
                disabled={savingProfile}
              >
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleSaveProfile}
                activeOpacity={0.8}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>บันทึก</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 📋 Modal เลือกระดับกิจกรรม (ซ้อนอยู่บน modal แก้ไขข้อมูล) */}
      <Modal visible={showActivityModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActivityModal(false)}
        >
          <View style={styles.pickerModalCard}>
            {activityLevels.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.optionItem}
                onPress={() => {
                  setEditActivity(item);
                  setShowActivityModal(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}