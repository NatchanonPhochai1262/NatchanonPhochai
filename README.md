# Application for Daily Calorie Balance Logging

แอปพลิเคชันติดตามสมดุลแคลอรี่รายวันสำหรับบันทึกอาหาร การออกกำลังกาย และการวิเคราะห์พลังงานที่ใช้ในแต่ละวัน  
ระบบนี้ออกแบบมาเพื่อช่วยให้ผู้ใช้สามารถติดตามพฤติกรรมการกินและการออกกำลังกายอย่างต่อเนื่อง พร้อมทั้งดูสรุปสุขภาพจากข้อมูลแคลอรี่ในแต่ละวัน

## Project Links
- GitHub Repository: https://github.com/NatchanonPhochai1262/NatchanonPhochai
- วิดีโอแนะนำ Project : [คลิปสอนใช้](https://youtu.be/1ZmZuAdfAhA)

---

## Overview

โปรเจกต์นี้เป็นแอปพลิเคชันที่ช่วยให้ผู้ใช้สามารถ:

- บันทึกอาหารที่บริโภคและแคลอรี่ที่ได้รับ
- บันทึกการออกกำลังกายและแคลอรี่ที่เผาผลาญ
- ดูสรุปสมดุลแคลอรี่รายวัน
- ตรวจสอบประวัติการบันทึกย้อนหลัง
- ดูกราฟสรุป 7 วัน เพื่อประเมินแนวโน้มการใช้พลังงาน
- จัดการข้อมูลส่วนตัวและค่า TDEE (Total Daily Energy Expenditure)

นอกจากนี้ระบบยังมีส่วนสำหรับผู้ดูแลระบบ (Admin) เพื่อจัดการข้อมูลอาหารหลักและดูแลข้อมูลในฐานข้อมูลของแอป

---

## Features

### For Users
- สมัครสมาชิกและเข้าสู่ระบบ
- บันทึกข้อมูลอาหารที่บริโภค
- บันทึกการออกกำลังกายและค่าแคลอรี่ที่เผาผลาญ
- ดูสรุปสมดุลแคลอรี่ในแต่ละวัน
- ดูประวัติการบันทึกย้อนหลัง
- ดูกราฟ 7 วันแบบภาพรวม
- แก้ไขข้อมูลโปรไฟล์ส่วนตัว
- ลบข้อมูลที่ผู้ใช้เองบันทึกได้
- รองรับการใช้งานแบบ Guest สำหรับผู้ที่ยังไม่ได้เข้าสู่ระบบ

### For Admin
- เข้าสู่ระบบผู้ดูแลระบบ
- จัดการข้อมูลอาหารหลักในแอป
- เพิ่มแก้ไขและลบรายการอาหาร
- ตรวจสอบข้อมูลและควบคุมการทำงานของแอป

---

## Tech Stack

### Frontend (Mobile App)
- React Native
- Expo
- Firebase Authentication
- Firestore
- JavaScript / JSX

### Admin Panel
- React
- Vite
- Firebase

### Backend / Database
- Firebase Authentication
- Firestore Database

---

## Installation
```bash
git clone https://github.com/NatchanonPhochai1262/NatchanonPhochai.git
cd NatchanonPhochai
npm install
npm run web

# Admin
cd admin
npm install
npm run dev

# Firebase Setup
# Create a Firebase project
# Enable Authentication and Firestore
# Add Firebase config and fill required environment values
# Deploy Firestore rules:
npx firebase deploy --only firestore:rules
