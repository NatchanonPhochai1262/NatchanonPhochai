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
# 2. อ่านข้อมูลจากไฟล์ Menu.xlsx
# ----------------------------------------------------
df = pd.read_excel('Menu.xlsx')

col_name = [c for c in df.columns if 'ชื่อ' in c or 'เมนู' in c][0]
col_unit = [c for c in df.columns if 'หน่วย' in c or 'ปริมาณ' in c and 'แคลอรี่' not in c][0]
col_cal = [c for c in df.columns if 'แคลอรี่' in c or 'kcal' in c.lower()][0]

# อ่านตัวเลขแคลอรี่จากค่าที่ได้ใน Excel และคืนค่า 0 เมื่อไม่มีตัวเลข
def parse_calories(val):
    if pd.isna(val): return 0
    match = re.search(r'(\d+[\.\d]*)', str(val).replace(',', ''))
    return int(float(match.group(1))) if match else 0

# จัดหมวดหมู่อาหารจากชื่อเพื่อบันทึกเป็นข้อมูลแค็ตตาล็อกใน Firestore
def categorize_food(name):
    name_l = str(name).lower().strip()
    
    # 1. อาหารจานหลัก (ยกเว้น ขนมจีน ขนมจีบ)
    savory_khanom = ['ขนมจีน', 'ขนมจีบ', 'ขนมหัวผักกาด', 'ขนมผักกาด']
    if any(k in name_l for k in savory_khanom): 
        return 'อาหารจานหลัก'

    # 2. ของหวาน
    sweets_keywords = ['ขนม', 'กล้วย', 'เค้ก', 'ทองหยิบ', 'ฝอยทอง', 'สังขยา', 'วุ้น', 'ไอศกรีม', 'ไอติม', 'บัวลอย', 'เฉาก๊วย', 'ทับทิมกรอบ', 'มะม่วง', 'ทุเรียน', 'ผลไม้', 'ช็อกโกแลต', 'โดนัท', 'โรตี', 'ส้ม']
    savory_sweet_exceptions = ['แกง', 'ผัด', 'ต้ม', 'ยำ', 'ส้มตำ', 'ทอด', 'ย่าง', 'นึ่ง', 'ซาลาเปาไส้หมู']
    for sw in sweets_keywords:
        if sw in name_l and not any(ex in name_l for ex in savory_sweet_exceptions):
            return 'ของหวาน'

    # 3. เครื่องดื่ม
    drinks_keywords = ['ชา', 'กาแฟ', 'นมสด', 'โอเลี้ยง', 'ไมโล', 'โกโก้', 'น้ำอัดลม', 'น้ำส้ม', 'น้ำมะนาว', 'น้ำผลไม้', 'โซดา', 'ชามะนาว', 'ลาเต้', 'อเมริกาโน่']
    savory_drink_exceptions = ['ก๋วยเตี๋ยว', 'ต้มยำ', 'น้ำพริก', 'น้ำตก', 'แกง', 'ราดหน้า', 'เกาเหลา', 'กระเพาะปลา', 'ผัด', 'ทอด']
    for d in drinks_keywords:
        if d in name_l and not any(s in name_l for s in savory_drink_exceptions):
            return 'เครื่องดื่ม'

    # 4. อาหารคลีน
    clean_keywords = ['อกไก่', 'สลัด', 'คลีน', 'ไข่ต้ม', 'ปลานึ่ง', 'ผักต้ม', 'ข้าวกล้อง', 'ปลาเผา']
    for c in clean_keywords:
        if c in name_l: 
            return 'อาหารคลีน'

    return 'อาหารจานหลัก'

# ----------------------------------------------------
# 3. ส่งข้อมูลเข้า Collection 'foodLogs' บน Firebase
# ----------------------------------------------------
collection_ref = db.collection('foodLogs')
batch = db.batch()
count = 0

print("⏳ กำลังเริ่มนำเข้าข้อมูลอาหารลงคอลเลกชัน 'foodLogs'...")

for _, row in df.iterrows():
    name = str(row[col_name]).strip()
    unit = str(row[col_unit]).strip()
    calories = parse_calories(row[col_cal])
    category = categorize_food(name)

    doc_ref = collection_ref.document() # สุ่ม Document ID อัตโนมัติ
    batch.set(doc_ref, {
        'name': name,
        'unit': unit,
        'calories': calories,
        'category': category,
        'createdAt': firestore.SERVER_TIMESTAMP
    })
    count += 1

    # ยิงเข้า Firebase ทีละ 400 รายการเพื่อความรวดเร็ว
    if count % 400 == 0:
        batch.commit()
        batch = db.batch()
        print(f"✅ บันทึกแล้ว {count} รายการ...")

if count % 400 != 0:
    batch.commit()

print(f"🎉 สำเร็จ! นำเข้าข้อมูลอาหารทั้งหมด {count} รายการลง Firebase Collection 'foodLogs' เรียบร้อยแล้ว")