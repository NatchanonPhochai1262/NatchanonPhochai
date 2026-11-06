// แปลงวันที่เป็น YYYY-MM-DD โดยชดเชยเขตเวลาเพื่อไม่ให้วันเลื่อนไปวันก่อนหน้า
export const getStrDate = (d = new Date()) => {
  const offset = d.getTimezoneOffset();
  const date = new Date(d.getTime() - (offset * 60 * 1000));
  return date.toISOString().split('T')[0];
};

// แปลงวันที่ YYYY-MM-DD เป็นวันที่ภาษาไทย พ.ศ. สำหรับแสดงใน UI
export const getThaiDate = (dStr) => {
  if (!dStr) return '';
  const parts = dStr.split('-');
  const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const m = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${dObj.getDate()} ${m[dObj.getMonth()]} ${dObj.getFullYear() + 543}`;
};

// คืนชื่อวันภาษาไทยแบบย่อสำหรับป้ายกำกับกราฟ
export const getShortDay = (d) => {
  return ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."][d.getDay()];
};

// คืนค่าสีตามพลังงานสุทธิเทียบกับ TDEE; ใช้เมื่อหน้าจอเรียก helper นี้
export const getColorForNet = (net, tdee) => {
  if (net > tdee) return '#FF4B4B'; // danger
  if (net >= tdee * 0.8) return '#00D084'; // success
  return '#FFB020'; // warning
};

// คำนวณ TDEE ด้วยสูตร Harris-Benedict; สูตรหลักที่ใช้ในหน้าสมัคร/โปรไฟล์อยู่ด้านล่าง
export const calculateTDEE = (gender, age, height, weight, activity = 1.375) => {
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseInt(age) || 0;
  const act = parseFloat(activity) || 1.375;

  const bmr = (gender === 'M')
    ? 66.5 + (13.75 * w) + (5.003 * h) - (6.775 * a)
    : 655.1 + (9.563 * w) + (1.850 * h) - (4.676 * a);

  return Math.round(bmr * act);
};

// รายการระดับกิจกรรม ใช้ร่วมกันทั้งหน้าสมัครสมาชิกและหน้าแก้ไขโปรไฟล์
export const activityLevels = [
  'นั่งทำงานเป็นส่วนใหญ่ (ไม่ค่อยได้ออกกำลังกาย)',
  'ออกกำลังกายเล็กน้อย (1-3 วัน/สัปดาห์)',
  'ออกกำลังกายปานกลาง (3-5 วัน/สัปดาห์)',
  'ออกกำลังกายหนัก (6-7 วัน/สัปดาห์)',
];

// สูตร Mifflin-St Jeor ใช้ข้อมูลร่างกายและตัวคูณกิจกรรม; ใช้ร่วมกันตอนสมัครและแก้โปรไฟล์
// gender รับค่าเป็น 'ชาย' หรือ 'หญิง', activity รับค่าเป็นข้อความจาก activityLevels
export const calculateTDEEMifflin = (gender, age, height, weight, activity) => {
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseFloat(age) || 0;

  let bmr = 10 * w + 6.25 * h - 5 * a;
  bmr += gender === 'ชาย' ? 5 : -161;

  let multiplier = 1.2;
  if (activity?.includes('เล็กน้อย')) multiplier = 1.375;
  else if (activity?.includes('ปานกลาง')) multiplier = 1.55;
  else if (activity?.includes('หนัก')) multiplier = 1.725;

  return Math.round(bmr * multiplier);
};