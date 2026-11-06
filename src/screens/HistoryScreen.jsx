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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './HistoryScreen.styles';

// Import Firebase
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// หน้าประวัติรวม log อาหารและออกกำลังกาย เพื่อแสดงรายวันและกราฟ 7 วัน
export default function HistoryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('daily'); // 'daily' | 'overview'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userData, setUserData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Raw logs data จาก Firebase
  const [foodLogs, setFoodLogs] = useState([]);
  const [exerciseLogs, setExerciseLogs] = useState([]);

  // แปลงวันที่เป็น key เดียวกับ loggedDate ใน Firestore เพื่อค้น log ของวันนั้น
  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // แปลงวันที่เป็นข้อความภาษาไทย พ.ศ. สำหรับแสดงบนหน้าจอ
  const formatThaiDate = (date) => {
    const day = date.getDate();
    const monthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const monthStr = monthNames[date.getMonth()];
    const thaiYear = date.getFullYear() + 543;
    return `${day} ${monthStr} ${thaiYear}`;
  };

  // เลื่อนวันที่ที่กำลังดูตามจำนวนวันบวกหรือลบ
  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  useEffect(() => {
    let unsubFood = null;
    let unsubExercise = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // โหลดโปรไฟล์เพื่อใช้ค่า TDEE เป็นค่าอ้างอิงในหน้าประวัติ
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (err) {
        console.log('Error fetching user doc:', err);
      }

      // ฟัง log อาหารของผู้ใช้แบบเรียลไทม์ และแปลงข้อมูล Firestore เป็นรูปแบบที่หน้าจอใช้
      const foodRef = collection(db, 'users', currentUser.uid, 'foodLogs');
      unsubFood = onSnapshot(foodRef, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const cal = Number(data.calories);
          list.push({
            id: docSnap.id,
            name: data.foodName || data.name || 'รายการอาหาร',
            calories: Number.isFinite(cal) ? cal : 0,
            loggedDate: data.loggedDate,
            type: 'food',
          });
        });
        setFoodLogs(list);
      }, (err) => {
        console.log('❌ Error listening foodLogs:', err);
        setLoading(false);
      });

      // ฟัง log การออกกำลังกายของผู้ใช้แบบเรียลไทม์
      const exRef = collection(db, 'users', currentUser.uid, 'exerciseLogs');
      unsubExercise = onSnapshot(exRef, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const cal = Number(data.calories);
          list.push({
            id: docSnap.id,
            name: data.exerciseName || data.name || 'การออกกำลังกาย',
            calories: Number.isFinite(cal) ? cal : 0,
            loggedDate: data.loggedDate,
            type: 'exercise',
          });
        });
        setExerciseLogs(list);
        setLoading(false);
      }, (err) => {
        console.log('❌ Error listening exerciseLogs:', err);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubFood) unsubFood();
      if (unsubExercise) unsubExercise();
    };
  }, []);

  // เป้าหมาย TDEE
  const targetTdee = Number(userData?.tdee || 2056);

  // 🔥 ยอดรวมการเผาผลาญสะสมทั้งหมด (All-time Total Burned Calories)
  const totalBurnedAllTime = exerciseLogs.reduce((acc, curr) => acc + curr.calories, 0);

  // --- รายวัน: เลือกเฉพาะ log ที่วันที่ตรงกับวันที่ผู้ใช้กำลังดู แล้วรวมแคลอรี่ ---
  const selectedDateStr = formatDateKey(currentDate);
  const dailyFoods = foodLogs.filter((item) => item.loggedDate === selectedDateStr);
  const dailyExercises = exerciseLogs.filter((item) => item.loggedDate === selectedDateStr);

  const dailyFoodCals = dailyFoods.reduce((acc, curr) => acc + curr.calories, 0);
  const dailyBurnCals = dailyExercises.reduce((acc, curr) => acc + curr.calories, 0);
  const dailyNetCals = dailyFoodCals - dailyBurnCals;
  const dailyList = [...dailyFoods, ...dailyExercises];

  // --- ภาพรวม: รวมพลังงานสุทธิแยกแต่ละวันในช่วง 7 วันล่าสุดสำหรับแสดงกราฟ ---
  const thaiDayShortNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const last7DaysData = [];
  const todayObj = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayObj);
    d.setDate(d.getDate() - i);
    const dateKey = formatDateKey(d);

    const dayFoods = foodLogs.filter((item) => item.loggedDate === dateKey);
    const dayExs = exerciseLogs.filter((item) => item.loggedDate === dateKey);

    const fCals = dayFoods.reduce((acc, curr) => acc + curr.calories, 0);
    const bCals = dayExs.reduce((acc, curr) => acc + curr.calories, 0);
    const net = fCals - bCals;

    const isToday = i === 0;
    const label = isToday ? 'วันนี้' : thaiDayShortNames[d.getDay()];

    last7DaysData.push({
      dateKey,
      label,
      netCals: net,
    });
  }

  // ค่าเฉลี่ย 7 วัน
  const total7DaysNet = last7DaysData.reduce((acc, curr) => acc + curr.netCals, 0);
  const avg7DaysNet = Math.round(total7DaysNet / 7);

  // ค่าสูงสุดสำหรับตั้งสัดส่วนกราฟ
  const maxNetIn7Days = Math.max(...last7DaysData.map((d) => d.netCals), targetTdee);

  // เลือกสีแท่งกราฟตามพลังงานสุทธิเมื่อเทียบกับ TDEE
  const getBarColor = (net) => {
    if (net === 0) return '#FFA726';
    if (net < targetTdee * 0.7) return '#FFA726'; // ยังน้อยเกินไป (ส้ม)
    if (net <= targetTdee) return '#00D68F';      // ระดับเหมาะสม (เขียว)
    return '#FF3B30';                              // เกินกำหนด (แดง)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* หัวข้อหลัก */}
        <Text style={styles.mainTitleText}>ประวัติการบันทึก</Text>

        {/* Tab Switcher (รายวัน / ภาพรวม) */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentTab, selectedTab === 'daily' && styles.segmentTabActive]}
            activeOpacity={0.8}
            onPress={() => setSelectedTab('daily')}
          >
            <Text style={selectedTab === 'daily' ? styles.segmentTextActive : styles.segmentTextInactive}>
              รายวัน
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentTab, selectedTab === 'overview' && styles.segmentTabActive]}
            activeOpacity={0.8}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={selectedTab === 'overview' ? styles.segmentTextActive : styles.segmentTextInactive}>
              ภาพรวม
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF5722" />
          </View>
        ) : selectedTab === 'daily' ? (
          /* ================= 🗓️ TAB: รายวัน ================= */
          <View>
            {/* Date Selector */}
            <View style={styles.dateSelectorCard}>
              <TouchableOpacity style={styles.arrowButton} onPress={() => changeDate(-1)}>
                <Ionicons name="chevron-back" size={16} color="#637381" />
              </TouchableOpacity>

              <Text style={styles.dateTitleText}>{formatThaiDate(currentDate)}</Text>

              <TouchableOpacity style={styles.arrowButton} onPress={() => changeDate(1)}>
                <Ionicons name="chevron-forward" size={16} color="#637381" />
              </TouchableOpacity>
            </View>

            {/* 4 Cards Grid */}
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>เป้าหมาย (TDEE)</Text>
                  <Text style={styles.statCardValue}>{targetTdee}</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>รับประทาน</Text>
                  <Text style={styles.statCardValue}>{dailyFoodCals}</Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>เผาผลาญ</Text>
                  <Text style={styles.statCardValue}>{dailyBurnCals}</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>แคลอรี่สุทธิ</Text>
                  <Text style={[styles.statCardValue, { color: getBarColor(dailyNetCals) }]}>{dailyNetCals}</Text>
                </View>
              </View>
            </View>

            {/* Section รายการที่บันทึก */}
            <Text style={styles.sectionTitle}>รายการที่บันทึก</Text>

            {dailyList.length === 0 ? (
              <View style={styles.emptyListCard}>
                <Text style={styles.emptyText}>ไม่มีรายการบันทึกสำหรับวันนี้</Text>
              </View>
            ) : (
              <View style={styles.itemListContainer}>
                {dailyList.map((item, index) => (
                  <React.Fragment key={item.id || index}>
                    <View style={styles.itemRow}>
                      <View>
                          <Text style={styles.itemNameText}>{item.name}</Text>
                          <Text style={styles.itemCategoryText}>
                            {item.type === 'food' ? 'รับประทาน' : 'เผาผลาญ'}
                          </Text>
                      </View>
                      <Text style={styles.itemCalorieText}>{item.calories} kcal</Text>
                    </View>
                    {index < dailyList.length - 1 && <View style={styles.itemDashedLine} />}
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* ================= 📊 TAB: ภาพรวม ================= */
          <View>
            {/* Card แสดงยอดรวมการเผาผลาญสะสมทั้งหมด */}
            <View style={styles.totalBurnCard}>
              <View style={styles.totalBurnIconBg}>
                <Text style={{ fontSize: 24 }}>🔥</Text>
              </View>
              <View style={styles.totalBurnTextContainer}>
                <Text style={styles.totalBurnLabel}>เผาผลาญสะสมทั้งหมด</Text>
                <Text style={styles.totalBurnValue}>
                  {totalBurnedAllTime.toLocaleString()}{' '}
                  <Text style={styles.totalBurnUnit}>kcal</Text>
                </Text>
              </View>
            </View>

            {/* สรุปเฉลี่ย 7 วัน */}
            <View style={styles.overviewSummaryCard}>
              <Text style={styles.summarySubTitle}>สรุป 7 วันล่าสุด</Text>
              <Text style={styles.summaryMainTitle}>
                เฉลี่ย {avg7DaysNet.toLocaleString()} kcal/วัน
              </Text>
            </View>

            {/* กราฟ */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>กราฟแคลอรี่รับประทานสุทธิ</Text>

              <View style={styles.chartBarArea}>
                {last7DaysData.map((dayItem, idx) => {
                  const heightPercent = maxNetIn7Days > 0 
                    ? Math.max(Math.min((dayItem.netCals / maxNetIn7Days) * 100, 100), 8)
                    : 8;
                  const barColor = getBarColor(dayItem.netCals);

                  return (
                    <View key={idx} style={styles.barColumn}>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: `${heightPercent}%`,
                              backgroundColor: barColor,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>{dayItem.label}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Legend บอกสถานะสี */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FFA726' }]} />
                  <Text style={styles.legendText}>ยังน้อยเกินไป</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#00D68F' }]} />
                  <Text style={styles.legendText}>ระดับเหมาะสม</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
                  <Text style={styles.legendText}>เกินกำหนด</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation?.navigate('Home')}>
          <Ionicons name="bar-chart-outline" size={22} color="#8E8E93" />
          <Text style={styles.tabLabel}>หน้าแรก</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation?.navigate('History')}>
          <Ionicons name="calculator" size={22} color="#FF5722" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>ประวัติ</Text>
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

      {/* Modal สลับบันทึกอาหาร / การออกกำลังกาย */}
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