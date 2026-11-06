import React from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './HomeScreenGuest.styles'; // Import styles จากไฟล์ชื่อ HomeScreenGuest.styles.js

// หน้าแรกตัวอย่างสำหรับผู้ที่ยังไม่เข้าสู่ระบบ; ปุ่มฟีเจอร์สมาชิกจะพาไปหน้า Login
export default function HomeScreenGuest({ navigation }) {
  // แจ้งว่าต้องเข้าสู่ระบบก่อนใช้ฟีเจอร์สมาชิก และเปิดหน้า Login ได้จากปุ่มยืนยัน
  const handleRequireLogin = () => {
    Alert.alert(
      'ต้องเข้าสู่ระบบ',
      'กรุณาเข้าสู่ระบบ หรือ สมัครสมาชิก เพื่อเริ่มใช้งานฟีเจอร์นี้',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'เข้าสู่ระบบ', onPress: () => navigation?.navigate('Login') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
      <View style={styles.container}>
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.greetingText}>สวัสดี, ผู้ใช้งานทั่วไป</Text>
              <Text style={styles.titleText}>ภาพรวมวันนี้</Text>
            </View>
            <TouchableOpacity style={styles.infoBadge} onPress={handleRequireLogin}>
              <Ionicons name="information-circle" size={14} color="#FF6B00" />
              <Text style={styles.infoBadgeText}>หลักการลดน้ำหนัก</Text>
            </TouchableOpacity>
          </View>

          {/* Guest Banner */}
          <View style={styles.guestBanner}>
            <View style={styles.bannerLeft}>
              <View style={styles.bannerTitleRow}>
                <Ionicons name="people" size={18} color="#FFF" />
                <Text style={styles.bannerTitle}>โหมดผู้ใช้งานทั่วไป</Text>
              </View>
              <Text style={styles.bannerSubtitle}>
                ดูตัวอย่างการทำงานได้ แต่ไม่สามารถบันทึกข้อมูลได้
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => navigation?.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>เข้าสู่{"\n"}ระบบ</Text>
            </TouchableOpacity>
          </View>

          {/* Main Card */}
          <View style={styles.mainCard}>
            <Text style={styles.cardTitle}>พลังงานแคลอรี่</Text>

            <View style={styles.circleContainer}>
              <View style={styles.outerCircle}>
                <Text style={styles.calorieValue}>0</Text>
                <Text style={styles.calorieSubtext}>รับประทานสุทธิ</Text>
              </View>
            </View>

            <View style={styles.dashedBox}>
              <Ionicons name="document-text-outline" size={18} color="#8E8E93" />
              <Text style={styles.dashedText}>
                ยังไม่มีการบันทึกข้อมูล ลองบันทึกอาหารและกิจกรรมเพื่อดูแนวโน้มของคุณ
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>เป้าหมาย (TDEE)</Text>
                <Text style={styles.statValue}>0</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>รับประทาน</Text>
                <Text style={styles.statValue}>0</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>เผาผลาญ</Text>
                <Text style={styles.statValue}>0</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>บันทึกของวันนี้</Text>
        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={styles.bottomTabContainer}>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="bar-chart" size={22} color="#FF5722" />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>หน้าแรก</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={handleRequireLogin}>
            <Ionicons name="calculator-outline" size={22} color="#8E8E93" />
            <Text style={styles.tabLabel}>ประวัติ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.plusButton} onPress={handleRequireLogin}>
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={handleRequireLogin}>
            <MaterialCommunityIcons name="hamburger" size={22} color="#8E8E93" />
            <Text style={styles.tabLabel}>อาหาร</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={handleRequireLogin}>
            <Ionicons name="person-outline" size={22} color="#8E8E93" />
            <Text style={styles.tabLabel}>โปรไฟล์</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}