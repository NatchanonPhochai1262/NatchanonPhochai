import re
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore

# ----------------------------------------------------
# 1. เชื่อมต่อ Firebase ด้วยกุญแจ Private Key
# ----------------------------------------------------
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# ----------------------------------------------------
# 2. อ่านข้อมูลจากไฟล์ Exercise.xlsx
# ----------------------------------------------------
df = pd.read_excel('Exercise.xlsx')

# ฟังก์ชันแปลงค่าแคลอรี่ (คำนวณค่าเฉลี่ยให้อัตโนมัติ กรณีเป็นช่วง เช่น 250-600)
# อ่านแคลอรี่จาก Excel; ถ้าเป็นช่วงตัวเลขจะคำนวณค่าเฉลี่ยก่อนนำเข้า Firestore
def parse_calories(val):
    if pd.isna(val): return 0
    s = str(val).replace('แคลอรี่', '').replace(',', '').strip()
    
    # กรณีเป็นช่วงตัวเลข เช่น 250-600
    if '-' in s:
        parts = s.split('-')
        try:
            low_match = re.search(r'(\d+[\.\d]*)', parts[0])
            high_match = re.search(r'(\d+[\.\d]*)', parts[1])
            if low_match and high_match:
                low = float(low_match.group(1))
                high = float(high_match.group(1))
                return int((low + high) / 2)
        except:
            pass
            
    match = re.search(r'(\d+[\.\d]*)', s)
    return int(float(match.group(1))) if match else 0

# ฟังก์ชันแยกหมวดหมู่การออกกำลังกาย/กิจกรรม
# จัดหมวดหมู่กิจกรรมออกกำลังกายจากชื่อก่อนนำเข้า Firestore
def categorize_exercise(name):
    name_l = str(name).lower().strip()
    
    sports = ['บาสเก็ตบอล', 'วอลเล่ย์บอล', 'กอล์ฟ', 'ต่อยมวย', 'เทนนิส', 'แบดมินตัน', 'โบว์ลิ่ง', 'สเก็ต', 'ฟุตบอล']
    cardio = ['วิ่ง', 'ขี่จักรยาน', 'ปั่นจักรยาน', 'ว่ายน้ำ', 'เต้น', 'เดิน', 'แอโรบิค']
    stretching = ['โยคะ', 'ยืด']
    
    for s in sports:
        if s in name_l: return 'กีฬา'
    for c in cardio:
        if c in name_l: return 'คาร์ดิโอ'
    for st in stretching:
        if st in name_l: return 'ยืดเหยียด'
        
    return 'กิจกรรมทั่วไป'

# ----------------------------------------------------
# 3. ส่งข้อมูลเข้า Collection 'exercises' บน Firebase
# ----------------------------------------------------
collection_ref = db.collection('exercises')
batch = db.batch()
count = 0

print("⏳ กำลังเริ่มนำเข้าข้อมูลการออกกำลังกายลงคอลเลกชัน 'exercises'...")

# ตรวจสอบว่าแถวแรกเป็น Header หรือไม่
first_row_str = str(df.iloc[0, 0])
data_rows = df.iloc[1:] if 'ชนิดของกิจกรรม' in first_row_str or 'ตาราง' in first_row_str else df

for _, row in data_rows.iterrows():
    raw_name = row.iloc[0]
    raw_cal = row.iloc[1]
    
    if pd.isna(raw_name) or str(raw_name).strip() == '' or 'ชนิดของกิจกรรม' in str(raw_name):
        continue
        
    name = str(raw_name).strip()
    calories = parse_calories(raw_cal)
    category = categorize_exercise(name)
    
    doc_ref = collection_ref.document() # สุ่ม Document ID อัตโนมัติ
    batch.set(doc_ref, {
        'name': name,
        'calories': calories,
        'category': category,
        'duration': '1 ชั่วโมง',
        'createdAt': firestore.SERVER_TIMESTAMP
    })
    count += 1

    if count % 400 == 0:
        batch.commit()
        batch = db.batch()
        print(f"✅ บันทึกแล้ว {count} รายการ...")

if count % 400 != 0:
    batch.commit()

print(f"🎉 สำเร็จ! นำเข้าข้อมูลการออกกำลังกายทั้งหมด {count} รายการลง Firebase Collection 'exercises' เรียบร้อยแล้ว")