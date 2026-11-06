import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './FoodScreen.styles';

// Import Firestore และ Auth
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';

// หน้าค้นหาแค็ตตาล็อกอาหารและเพิ่มรายการอาหารลงบันทึกส่วนตัวของสมาชิก
export default function FoodScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState({ label: 'วันนี้', value: new Date() });
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');

  // State สำหรับเก็บรายการอาหารจาก Database จริง
  const [foodList, setFoodList] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [foodLoadError, setFoodLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const categories = ['ทั้งหมด', 'อาหารจานหลัก', 'อาหารคลีน', 'เครื่องดื่ม', 'ของหวาน'];

  // 🔄 โหลดแค็ตตาล็อกอาหารส่วนกลางจาก Firestore แบบเรียลไทม์; นี่ไม่ใช่บันทึกส่วนตัวของผู้ใช้
  useEffect(() => {
    setLoadingFoods(true);
    setFoodLoadError(null);

    const q = query(collection(db, 'foodLogs'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const foods = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const name = typeof data.name === 'string' ? data.name.trim() : '';
          const calories = Number(data.calories);

          if (!name || !Number.isFinite(calories) || calories < 0) {
            return;
          }

          foods.push({
            id: doc.id,
            name,
            calories,
            category: typeof data.category === 'string' && data.category.trim() ? data.category.trim() : 'ทั่วไป',
          });
        });
        setFoodList(foods);
        setLoadingFoods(false);
      },
      (error) => {
        console.log('Error fetching food database:', error);
        setFoodLoadError('ไม่สามารถโหลดรายการอาหารได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่');
        setFoodList([]);
        setLoadingFoods(false);
      }
    );

    return () => unsubscribe();
  }, [reloadKey]);

  // สร้างตัวเลือกวันที่ย้อนหลัง 14 วันสำหรับกำหนดวันของบันทึกอาหาร
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

  // 🔍 กรองแค็ตตาล็อกจากหมวดหมู่และคำค้นที่ผู้ใช้เลือก
  const filteredFoods = foodList.filter((item) => {
    const matchesCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 💾 เพิ่มรายการอาหารที่เลือกลงบันทึกส่วนตัวของสมาชิก พร้อมวันที่และ uid
  const handleAddFood = async (food) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showAlert('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนทำการบันทึกข้อมูล');
      return;
    }

    const calories = Number(food.calories);
    if (!food.name || !Number.isFinite(calories) || calories < 0) {
      showAlert('ข้อมูลไม่ถูกต้อง', 'รายการอาหารนี้ไม่มีชื่อหรือจำนวนแคลอรี่ที่ถูกต้อง');
      return;
    }

    setSavingId(food.id);

    try {
      const targetDate = new Date(selectedDate.value);
      // แปลงเป็น YYYY-MM-DD แบบเวลาท้องถิ่น
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      await addDoc(collection(db, 'users', currentUser.uid, 'foodLogs'), {
        foodName: food.name,
        calories,
        category: food.category || 'ทั่วไป',
        loggedDate: dateString,
        createdAt: serverTimestamp(),
      });

      setSavingId(null);
      showAlert('บันทึกสำเร็จ', `บันทึก "${food.name}" (${calories} kcal) เรียบร้อยแล้ว`);
      return true;
    } catch (error) {
      setSavingId(null);
      console.log('Error adding food:', error);
      showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      return false;
    }
  };

  // ตรวจข้อมูลอาหารที่กรอกเอง แล้วส่งไปบันทึกใน log ส่วนตัวด้วยรูปแบบเดียวกับแค็ตตาล็อก
  const handleAddCustomFood = async () => {
    const name = customName.trim();
    const calories = Number(customCalories);

    if (!name) {
      showAlert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกชื่ออาหาร');
      return;
    }
    if (!customCalories.trim() || !Number.isFinite(calories) || calories <= 0 || calories > 10000) {
      showAlert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกแคลอรี่เป็นตัวเลขระหว่าง 1 - 10,000');
      return;
    }

    const ok = await handleAddFood({ id: 'custom', name, calories, category: 'กำหนดเอง' });
    if (ok) {
      setCustomName('');
      setCustomCalories('');
      setShowCustomForm(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.titleText}>บันทึกอาหาร</Text>
          <Text style={styles.subtitleText}>เลือกรายการอาหารเพื่อบันทึกแคลอรี่</Text>
        </View>

        {/* เลือกวันที่ */}
        <View style={styles.dateSelectorCard}>
          <View style={styles.dateSelectorLeft}>
            <Text style={{ fontSize: 16 }}>📅</Text>
            <Text style={styles.dateSelectorLabel}>เลือกวันที่บันทึก:</Text>
          </View>
          <TouchableOpacity style={styles.dateDropdownButton} onPress={() => setIsDateModalVisible(true)} activeOpacity={0.7}>
            <Text style={styles.dateDropdownText}>{selectedDate.label}</Text>
            <Ionicons name="caret-down" size={14} color="#FF5722" />
          </TouchableOpacity>
        </View>

        {/* ค้นหา */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#919EAB" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาเมนูอาหาร..."
            placeholderTextColor="#919EAB"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* เพิ่มอาหารเอง */}
        <TouchableOpacity
          style={styles.customToggleButton}
          onPress={() => setShowCustomForm((v) => !v)}
          activeOpacity={0.8}
        >
          <Ionicons name={showCustomForm ? 'remove-circle-outline' : 'add-circle-outline'} size={20} color="#FF5722" />
          <Text style={styles.customToggleText}>
            {showCustomForm ? 'ซ่อนฟอร์ม' : 'ไม่พบเมนู? เพิ่มอาหารเอง'}
          </Text>
        </TouchableOpacity>

        {showCustomForm && (
          <View style={styles.customFormCard}>
            <TextInput
              style={styles.customInput}
              placeholder="ชื่ออาหาร เช่น ข้าวมันไก่"
              placeholderTextColor="#919EAB"
              value={customName}
              onChangeText={setCustomName}
              maxLength={60}
            />
            <TextInput
              style={styles.customInput}
              placeholder="แคลอรี่ (kcal)"
              placeholderTextColor="#919EAB"
              keyboardType="numeric"
              value={customCalories}
              onChangeText={(t) => setCustomCalories(t.replace(/[^0-9.]/g, ''))}
              maxLength={7}
            />
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleAddCustomFood}
              disabled={savingId === 'custom'}
              activeOpacity={0.8}
            >
              {savingId === 'custom' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.retryButtonText, { textAlign: 'center' }]}>บันทึก</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* หมวดหมู่ */}
        <View style={{ height: 44, marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* รายการอาหารจาก Firestore */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.foodListContent}>
          {loadingFoods ? (
            <ActivityIndicator size="large" color="#FF5722" style={{ marginTop: 40 }} />
          ) : foodLoadError ? (
            <View style={styles.errorState}>
              <Text style={styles.errorText}>{foodLoadError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setReloadKey((key) => key + 1)}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>ลองใหม่</Text>
              </TouchableOpacity>
            </View>
          ) : filteredFoods.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'ไม่พบเมนูอาหารที่ค้นหา' : 'ยังไม่มีรายการอาหารในคลังข้อมูล'}
              </Text>
            </View>
          ) : (
            <View style={styles.foodCardContainer}>
              {filteredFoods.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.foodItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.foodNameText}>{item.name}</Text>
                      <Text style={styles.foodCategoryText}>{item.category || 'ทั่วไป'}</Text>
                    </View>

                    <View style={styles.foodRightSection}>
                      <Text style={styles.foodCalorieText}>{item.calories} kcal</Text>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddFood(item)}
                        disabled={savingId === item.id}
                        activeOpacity={0.8}
                      >
                        {savingId === item.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Ionicons name="add" size={22} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  {index < filteredFoods.length - 1 && <View style={styles.itemDivider} />}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* 🧭 Bottom Navigation Bar (ปรับปรุงปุ่มกดทุกหน้าแล้ว) */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('Home')} activeOpacity={0.7}>
          <Ionicons name="bar-chart-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>หน้าแรก</Text>
        </TouchableOpacity>

        {/* ✅ เพิ่ม onPress ไปหน้า History */}
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('History')} activeOpacity={0.7}>
          <Ionicons name="calculator-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>ประวัติ</Text>
        </TouchableOpacity>

        {/* ปุ่ม + ตรงกลาง */}
        <TouchableOpacity style={styles.plusButtonOuter} activeOpacity={0.85} onPress={() => setIsActionModalVisible(true)}>
          <View style={styles.plusButtonInner}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* หน้าปัจจุบัน (อาหาร) */}
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Ionicons name="fast-food" size={22} color="#FF5722" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>อาหาร</Text>
        </TouchableOpacity>

        {/* ✅ เพิ่ม onPress ไปหน้า Profile */}
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('Profile')} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>โปรไฟล์</Text>
        </TouchableOpacity>
      </View>

      {/* Modal เลือกวันที่ */}
      <Modal
        visible={isDateModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsDateModalVisible(false)}
      >
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

      {/* Modal สลับรายการปุ่ม + */}
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
                  onPress={() => setIsActionModalVisible(false)}
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