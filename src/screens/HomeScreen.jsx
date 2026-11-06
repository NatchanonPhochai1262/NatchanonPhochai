import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { styles } from './HomeScreen.styles';

// Import Firestore และ Auth
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// หน้าแรกสมาชิก: โหลดข้อมูลวันนี้ คำนวณสมดุลพลังงาน และแสดงรายการที่บันทึก
export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 💡 State สำหรับเปิด-ปิด Modal "หลักการลดน้ำหนัก"
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

  // State สำหรับเก็บข้อมูล
  const [todayActivities, setTodayActivities] = useState([]);
  const [foodCalories, setFoodCalories] = useState(0);
  const [burnedCalories, setBurnedCalories] = useState(0);
  const [selectedActivityKey, setSelectedActivityKey] = useState(null);
  const [deletingActivityKey, setDeletingActivityKey] = useState(null);

  // 📅 ฟังก์ชันดึงวันที่ปัจจุบัน YYYY-MM-DD (ใช้เวลาท้องถิ่นของเครื่อง)
  // สร้างวันที่วันนี้ตามเวลาท้องถิ่นในรูปแบบเดียวกับ loggedDate
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    let unsubFood = null;
    let unsubExercise = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        console.log('🔴 HomeScreen: ไม่พบสิทธิ์ผู้ใช้งาน');
        setLoading(false);
        return;
      }

      console.log('🟢 HomeScreen: กำลังดึงข้อมูลของผู้ใช้ UID =', currentUser.uid);

      // โหลดโปรไฟล์ของสมาชิกเพื่อใช้แสดงข้อมูลและค่า TDEE บนหน้าแรก
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        }
      } catch (error) {
        console.log('❌ Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }

      const todayStr = getTodayDateString();
      console.log('📅 ดึงข้อมูลเฉพาะของวันที่:', todayStr);

      let currentFoods = [];
      let currentExercises = [];

      // ฟังก์ชันรวมรายการและคำนวณพลังงาน
      // รวมแคลอรี่จาก log ทั้งสองประเภทและอัปเดตการ์ดสรุปกับรายการวันนี้
      const calculateTotals = () => {
        let sumFood = 0;
        let sumBurn = 0;

        currentFoods.forEach((item) => (sumFood += item.calories));
        currentExercises.forEach((item) => (sumBurn += item.calories));

        setFoodCalories(sumFood);
        setBurnedCalories(sumBurn);

        const allCombined = [...currentFoods, ...currentExercises];
        console.log(`📊 รวมผลลัพธ์วันนี้ -> อาหาร: ${sumFood} kcal | เบิร์น: ${sumBurn} kcal | ทั้งหมด ${allCombined.length} รายการ`);
        setTodayActivities(allCombined);
      };

      // ฟังรายการอาหารของผู้ใช้คนนี้เฉพาะวันที่ปัจจุบัน และอัปเดตทันทีเมื่อ Firestore เปลี่ยน
      const foodRef = collection(db, 'users', currentUser.uid, 'foodLogs');
      const foodQuery = query(foodRef, where('loggedDate', '==', todayStr));

      unsubFood = onSnapshot(foodQuery, (snapshot) => {
        currentFoods = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const foodName = data.foodName || data.name || data.title || 'รายการอาหาร';
          const calories = Number(data.calories || data.calorie || data.cals || 0);

          currentFoods.push({
            id: docSnap.id,
            name: foodName,
            calories: calories,
            category: data.category || 'อาหาร',
            type: 'food',
          });
        });
        calculateTotals();
      }, (err) => console.log('❌ Error listening foodLogs:', err));

      // ฟังรายการออกกำลังกายของผู้ใช้คนนี้เฉพาะวันที่ปัจจุบัน
      const exerciseRef = collection(db, 'users', currentUser.uid, 'exerciseLogs');
      const exerciseQuery = query(exerciseRef, where('loggedDate', '==', todayStr));

      unsubExercise = onSnapshot(exerciseQuery, (snapshot) => {
        currentExercises = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const exName = data.exerciseName || data.name || data.title || 'กิจกรรมออกกำลังกาย';
          const calories = Number(data.calories || data.calorie || data.cals || 0);

          currentExercises.push({
            id: docSnap.id,
            name: exName,
            calories: calories,
            category: data.category || 'ออกกำลังกาย',
            type: 'exercise',
          });
        });
        calculateTotals();
      }, (err) => console.log('❌ Error listening exerciseLogs:', err));
    });

    return () => {
      unsubscribeAuth();
      if (unsubFood) unsubFood();
      if (unsubExercise) unsubExercise();
    };
  }, []);

  // พลังงานสุทธิใช้สูตรอาหารลบการออกกำลังกาย; เปรียบเทียบกับ TDEE เพื่อเลือกสถานะหน้าแรก
  const targetTdee = Number(userData?.tdee || 2056);
  const netCalories = foodCalories - burnedCalories;

  // 📐 คำนวณ SVG Ring
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const rawProgress = targetTdee > 0 ? netCalories / targetTdee : 0;
  const progressPercent = Math.min(Math.max(rawProgress, 0), 1);
  const strokeDashoffset = circumference - progressPercent * circumference;

  // 🎨 สีสถานะหลอด/ตัวเลขแคลอรี่ (ส้ม = น้อยเกินไป, เขียว = เหมาะสม, แดง = เกินกำหนด)
  // กำหนดสีวงแหวนและตัวเลขตามพลังงานสุทธิเทียบกับ TDEE
  const getStatusColor = () => {
    if (netCalories < targetTdee * 0.6) return '#FFA726'; // ยังน้อยเกินไป
    if (netCalories <= targetTdee) return '#00D68F'; // ระดับเหมาะสม
    return '#FF3B30'; // เกินกำหนด
  };
  const statusColor = getStatusColor();

  // 🎨 คำนวณข้อความแจ้งเตือน
  // เลือกข้อความและสีของคำแนะนำตามสถานะพลังงานปัจจุบัน
  const getStatusAlert = () => {
    if (netCalories === 0) {
      return {
        bgColor: '#FFF8E1',
        titleColor: '#F57C00',
        textColor: '#E65100',
        icon: '📝',
        title: 'ยังไม่มีการบันทึกข้อมูลวันนี้',
        desc: 'ลองเริ่มบันทึกมื้ออาหารแรกของคุณ เพื่อให้ระบบช่วยติดตามโภชนาการวันนี้ได้แม่นยำขึ้นครับ',
      };
    } else if (netCalories < targetTdee * 0.6) {
      return {
        bgColor: '#FFF3E0',
        titleColor: '#E65100',
        textColor: '#D84315',
        icon: '⚠️',
        title: 'รับประทานน้อยเกินไป!',
        desc: 'การอดอาหารอาจทำให้ระบบเผาผลาญทำงานช้าลง ควรรับประทานเพิ่มให้อยู่ในระดับที่เหมาะสม',
      };
    } else if (netCalories <= targetTdee) {
      return {
        bgColor: '#E8F5E9',
        titleColor: '#2E7D32',
        textColor: '#1B5E20',
        icon: '✅',
        title: 'ระดับพลังงานกำลังเหมาะสม!',
        desc: 'คุณรับประทานอาหารอยู่ในกรอบแคลอรี่เป้าหมายได้อย่างยอดเยี่ยม พยายามรักษามาตรฐานไว้นะครับ',
      };
    } else {
      return {
        bgColor: '#FFEBEE',
        titleColor: '#C62828',
        textColor: '#B71C1C',
        icon: '🚨',
        title: 'รับประทานเกินเป้าหมาย!',
        desc: 'วันนี้ได้รับพลังงานเกิน TDEE แล้ว ลองออกกำลังกายเพื่อเบิร์นแคลอรี่ส่วนเกินออกดูนะครับ',
      };
    }
  };

  const statusAlert = getStatusAlert();

  // สร้าง key ไม่ซ้ำระหว่าง log อาหารและ log ออกกำลังกายที่อาจมี id ซ้ำกัน
  const getActivityKey = (item) => `${item.type}:${item.id}`;

  // ลบ log ของสมาชิกจาก collection ให้ตรงกับชนิดรายการที่เลือก
  const deleteActivity = async (item) => {
    const currentUser = auth.currentUser;
    const activityKey = getActivityKey(item);
    if (!currentUser || deletingActivityKey) return;

    const collectionName = item.type === 'food' ? 'foodLogs' : 'exerciseLogs';
    setDeletingActivityKey(activityKey);
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, collectionName, item.id));
      setSelectedActivityKey(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
      const message = 'ไม่สามารถลบรายการได้ กรุณาลองใหม่อีกครั้ง';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('เกิดข้อผิดพลาด', message);
      }
    } finally {
      setDeletingActivityKey(null);
    }
  };

  // ขอคำยืนยันก่อนลบ และเรียก deleteActivity เมื่อผู้ใช้ยืนยัน
  const confirmDeleteActivity = (item) => {
    const message = `ต้องการลบรายการ "${item.name}" ใช่หรือไม่?`;
    if (Platform.OS === 'web') {
      if (window.confirm(message)) deleteActivity(item);
      return;
    }

    Alert.alert('ยืนยันการลบ', message, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => deleteActivity(item) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.topHeaderContainer}>
          <View>
            <Text style={styles.greetingText}>
              สวัสดี, {userData?.fullName ? userData.fullName.split(' ')[0] : 'ผู้ใช้งาน'}
            </Text>
            <Text style={styles.mainTitleText}>ภาพรวมวันนี้</Text>
          </View>

          {/* 💡 ปุ่มกดเปิด Modal คำแนะนำ */}
          <TouchableOpacity 
            style={styles.tipBadgeButton} 
            activeOpacity={0.8}
            onPress={() => setIsInfoModalVisible(true)}
          >
            <Ionicons name="information-circle" size={16} color="#FF5722" />
            <Text style={styles.tipBadgeText}>หลักการลดน้ำหนัก</Text>
          </TouchableOpacity>
        </View>

        {/* Card พลังงานแคลอรี่ */}
        <View style={styles.calorieCard}>
          <Text style={styles.calorieCardTitle}>พลังงานแคลอรี่</Text>

          {/* SVG Ring */}
          <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 16 }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#EAEFF5" strokeWidth={strokeWidth} fill="none" />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={statusColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>

            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Text style={{ fontSize: 40, fontFamily: 'Kanit_700Bold', color: statusColor }}>
                {netCalories}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Kanit_400Regular', color: '#8E8E93', marginTop: -4 }}>
                รับประทานสุทธิ
              </Text>
            </View>
          </View>

          {/* กล่องข้อความแจ้งเตือน */}
          <View style={{ backgroundColor: statusAlert.bgColor, borderRadius: 14, padding: 14, marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Kanit_700Bold', color: statusAlert.titleColor, marginBottom: 4 }}>
              {statusAlert.icon} {statusAlert.title}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: 'Kanit_400Regular', color: statusAlert.textColor, lineHeight: 18 }}>
              {statusAlert.desc}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* ตารางสรุป 3 ช่อง */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>เป้าหมาย (TDEE)</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#FF5722" />
              ) : (
                <Text style={styles.statValueBold}>{targetTdee}</Text>
              )}
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>รับประทาน</Text>
              <Text style={styles.statValueBold}>{foodCalories}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>เผาผลาญ</Text>
              <Text style={styles.statValueBold}>{burnedCalories}</Text>
            </View>
          </View>
        </View>

        {/* Section รายการของวันนี้ */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>บันทึกของวันนี้</Text>

          {todayActivities.length === 0 ? (
            <View style={styles.emptyTodayCard}>
              <Text style={styles.emptyTodayText}>ยังไม่มีการบันทึกข้อมูลในวันนี้</Text>
            </View>
          ) : (
            todayActivities.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 3,
                  elevation: 1,
                }}
              >
                <TouchableOpacity
                  style={{
                    padding: 4,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  activeOpacity={0.75}
                  onPress={() => {
                    const activityKey = getActivityKey(item);
                    setSelectedActivityKey(selectedActivityKey === activityKey ? null : activityKey);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Kanit_600SemiBold', color: '#161C24' }}>
                      {item.type === 'food' ? '🍔 ' : '🏃 '} {item.name}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: 'Kanit_400Regular', color: '#919EAB', marginTop: 2 }}>
                      {item.category}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Kanit_700Bold',
                      color: item.type === 'food' ? '#FF5722' : '#2E7D32',
                    }}
                  >
                    {item.type === 'food' ? `+${item.calories}` : `-${item.calories}`} kcal
                  </Text>
                </TouchableOpacity>
                {selectedActivityKey === getActivityKey(item) && (
                  <TouchableOpacity
                    style={{
                      marginTop: 10,
                      paddingVertical: 9,
                      borderRadius: 10,
                      backgroundColor: '#FF3B30',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    activeOpacity={0.8}
                    disabled={deletingActivityKey === getActivityKey(item)}
                    onPress={() => confirmDeleteActivity(item)}
                  >
                    {deletingActivityKey === getActivityKey(item) ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="trash-outline" size={17} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontFamily: 'Kanit_600SemiBold', marginLeft: 6 }}>
                          ลบรายการนี้
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation?.navigate('Home')}>
          <Ionicons name="bar-chart" size={22} color="#FF5722" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>หน้าแรก</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation?.navigate('History')}>
          <Ionicons name="calculator-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>ประวัติ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.plusButtonOuter} activeOpacity={0.85} onPress={() => setIsModalVisible(true)}>
          <View style={styles.plusButtonInner}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation?.navigate('Food')}>
          <Ionicons name="fast-food-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>อาหาร</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation?.navigate('Profile')}>
          <Ionicons name="person-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>โปรไฟล์</Text>
        </TouchableOpacity>
      </View>

      {/* 💡 Modal แสดงหลักการลดน้ำหนัก */}
      <Modal
        visible={isInfoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsInfoModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsInfoModalVisible(false)}>
          <View style={styles.modalOverlayCenter}>
            <TouchableWithoutFeedback>
              <View style={styles.infoModalCard}>
                <Text style={styles.infoModalTitle}>💡 หลักการลดน้ำหนักง่ายๆ</Text>

                <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                  {/* 1. BMR & TDEE */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionHeader}>🔥 BMR กับ TDEE คืออะไร?</Text>
                    <Text style={styles.infoText}>
                      • <Text style={styles.boldText}>BMR</Text> = พลังงานขั้นต่ำที่ร่างกายใช้พยุงชีวิต (แค่นอนเฉยๆ ก็เผาผลาญ){'\n'}
                      • <Text style={styles.boldText}>TDEE</Text> = พลังงานที่ใช้จริงทั้งวัน (เอา BMR + กิจกรรมและการออกกำลังกาย)
                    </Text>
                  </View>

                  {/* 2. คำนวณยังไง */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionHeader}>🧮 คิดจากอะไรบ้าง?</Text>
                    <Text style={styles.infoText}>
                      แอปจะเอาข้อมูลของคุณ เช่น <Text style={styles.boldText}>เพศ, อายุ, ส่วนสูง, น้ำหนัก</Text> และ <Text style={styles.boldText}>ระดับการขยับตัวในแต่ละวัน</Text> มาคำนวณหาเป้าหมายพลังงาน (TDEE) ที่เหมาะกับคุณที่สุดครับ
                    </Text>
                  </View>

                  {/* 3. แอปช่วยอะไร */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionHeader}>📱 แอปนี้ช่วยคุณยังไง?</Text>
                    <Text style={styles.infoText}>
                      ช่วยคอยจด <Text style={styles.boldText}>อาหารที่กิน 🍔</Text> กับ <Text style={styles.boldText}>การออกกำลังกาย 🏃</Text> เพื่อเช็กให้ชัวร์ว่า วันนี้คุณกินไม่เกินเป้าหมายที่จะทำให้น้ำหนักลดลงได้
                    </Text>
                  </View>

                  {/* 4. กลไกลดน้ำหนัก */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionHeader}>🎯 น้ำหนักลดได้ยังไง?</Text>
                    <Text style={styles.infoText}>
                      แค่กินให้น้อยกว่าค่า TDEE เล็กน้อย ร่างกายก็จะดึง <Text style={styles.boldText}>'ไขมันสะสม'</Text> ออกมาใช้เป็นพลังงานแทน
                    </Text>
                    
                    <View style={styles.highlightBox}>
                      <Text style={styles.highlightText}>
                        ✨ <Text style={styles.boldText}>ข้อควรรู้:</Text> เมื่อร่างกายดึงไขมันสะสมมาใช้ครบ <Text style={styles.boldText}>7,700 kcal</Text> น้ำหนักตัวจะลดลงประมาณ <Text style={styles.boldText}>1 กิโลกรัม</Text> ครับ
                      </Text>77777777777777777777777777777777777
                    </View>
                  </View>

                  {/* 5. ข้อระวัง */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionHeader}>⚠️ ข้อห้ามสำคัญ!</Text>
                    <Text style={styles.infoText}>
                      ห้ามกินน้อยกว่าค่า <Text style={styles.boldText}>BMR</Text> เด็ดขาด! ไม่งั้นร่างกายจะคิดว่ากำลังอดอยาก ทำให้ระบบเผาผลาญพัง และเสี่ยงโยโย่เอฟเฟกต์ได้ง่ายครับ
                    </Text>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.confirmBtnFull}
                  onPress={() => setIsInfoModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmBtnText}>เข้าใจแล้ว!</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal เลือกรายการ (+ บันทึกอาหาร / บันทึกการออกกำลังกาย) */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>เลือกรายการที่ต้องการบันทึก</Text>

                <TouchableOpacity
                  style={styles.foodOptionButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    setIsModalVisible(false);
                    navigation?.navigate('Food');
                  }}
                >
                  <Text style={styles.optionEmoji}>🍔</Text>
                  <Text style={styles.foodOptionText}>บันทึกอาหาร</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.exerciseOptionButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    setIsModalVisible(false);
                    navigation?.navigate('Exercise');
                  }}
                >
                  <Text style={styles.optionEmoji}>🏃</Text>
                  <Text style={styles.exerciseOptionText}>บันทึกการออกกำลังกาย</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}