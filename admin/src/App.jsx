import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut,
} from 'firebase/auth';
import { auth, db } from './firebase';

const categories = ['อาหารจานหลัก', 'อาหารคลีน', 'เครื่องดื่ม', 'ของหวาน'];

const actionLabels = {
  create: { icon: '➕', text: 'เพิ่มรายการอาหาร' },
  update: { icon: '✏️', text: 'แก้ไขข้อมูลอาหาร' },
  delete: { icon: '🗑️', text: 'ลบรายการอาหาร' },
};

const fieldLabels = { name: 'ชื่ออาหาร', category: 'หมวดหมู่', calories: 'แคลอรี่ (kcal)' };

// แปลง Firestore Timestamp เป็นวันและเวลาภาษาไทยสำหรับประวัติผู้ดูแล
function formatLogTime(timestamp) {
  const date = timestamp?.toDate ? timestamp.toDate() : null;
  if (!date) return '';
  return date.toLocaleString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// เพิ่มเหตุการณ์ CRUD ลง audit log เพื่อให้ตรวจสอบการจัดการของ Admin ย้อนหลังได้
async function logActivity(action, foodName, adminEmail, changes) {
  try {
    await addDoc(collection(db, 'adminActivityLogs'), {
      action, foodName, adminEmail, changes: changes || null, createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Non-critical: don't block the main CRUD action if logging fails.
    console.error('บันทึกประวัติการดำเนินการไม่สำเร็จ', err);
  }
}

// เปรียบเทียบข้อมูลก่อนและหลัง เพื่อเก็บเฉพาะฟิลด์ที่เปลี่ยนใน audit log
function diffFields(before, after) {
  // เก็บเฉพาะฟิลด์ที่เปลี่ยน เพื่อแสดงรายละเอียดในประวัติการจัดการ
  return Object.keys(fieldLabels)
    .filter((key) => String(before?.[key] ?? '') !== String(after?.[key] ?? ''))
    .map((key) => ({
      field: key, label: fieldLabels[key], before: before?.[key], after: after?.[key],
    }));
}

// หน้าล็อกอินผู้ดูแล พร้อมตรวจ custom claim ก่อนเปิด Dashboard
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // ตรวจบัญชีกับ Firebase Auth และ custom claim ก่อนอนุญาตให้เข้า Dashboard
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await credential.user.getIdTokenResult(true);
      if (token.claims.admin !== true) {
        await signOut(auth);
        throw new Error('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ');
      }
      onLogin(credential.user);
    } catch (err) {
      setError(err.message === 'บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ'
        ? err.message
        : 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark">🥑</div>
        <h1>แอปพลิเคชันบันทึกสมดุลแคลอรี่รายวัน</h1>
        <p className="brand-subtitle">Daily Calorie Balance</p>
        <p className="muted">ระบบจัดการข้อมูลสำหรับผู้ดูแลระบบ</p>
        <label>อีเมลผู้ดูแลระบบ<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label>รหัสผ่าน<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" disabled={busy}>{busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
      </form>
    </main>
  );
}

// ฟอร์มเพิ่มหรือแก้ไขชื่อ หมวดหมู่ และแคลอรี่ของรายการอาหารส่วนกลาง
function FoodForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || { name: '', category: categories[0], calories: '' });
  const [error, setError] = useState('');
  // ตรวจชื่อ หมวดหมู่ และแคลอรี่ก่อนส่งข้อมูลให้ Dashboard เพิ่มหรือแก้ไข
  const submit = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const calories = Number(form.calories);
    if (!name || !Number.isFinite(calories) || calories <= 0 || !form.category) {
      setError('กรุณากรอกชื่อ หมวดหมู่ และแคลอรี่ให้ถูกต้อง');
      return;
    }
    await onSave({ name, category: form.category, calories });
  };
  return <form className="modal-card" onSubmit={submit}>
    <div className="modal-heading"><h2>{initial ? 'แก้ไขรายการอาหาร' : 'เพิ่มรายการอาหาร'}</h2><button type="button" className="icon-button" onClick={onClose}>×</button></div>
    <label>ชื่ออาหาร<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
    <label>หมวดหมู่<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label>แคลอรี่ (kcal)<input type="number" min="1" step="1" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} required /></label>
    {error && <p className="form-error">{error}</p>}
    <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>ยกเลิก</button><button className="primary-button">บันทึก</button></div>
  </form>;
}

// กล่องยืนยัน/แจ้งผลแบบใช้ร่วมกันในหน้า Dashboard
function Dialog({
  tone, icon, title, message, cancelLabel, confirmLabel, onCancel, onConfirm,
}) {
  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <div className={`dialog-icon ${tone}`}>{icon}</div>
        <h2 className="dialog-title">{title}</h2>
        {message && <p className="dialog-message">{message}</p>}
        <div className="dialog-actions">
          {cancelLabel && <button type="button" className="dialog-btn cancel" onClick={onCancel}>{cancelLabel}</button>}
          <button type="button" className={`dialog-btn confirm-${tone}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// Dashboard สำหรับดูข้อมูลและประวัติ พร้อมเพิ่ม แก้ไข หรือลบแค็ตตาล็อกอาหาร
function Dashboard({ user }) {
  const [foods, setFoods] = useState([]);
  const [activity, setActivity] = useState([]);
  const [page, setPage] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ทั้งหมด');
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [successDialog, setSuccessDialog] = useState(null);
  const [viewLog, setViewLog] = useState(null);

  // ฟังแค็ตตาล็อกอาหารส่วนกลางแบบเรียลไทม์ ให้ Dashboard ใช้ข้อมูลล่าสุด
  useEffect(() => onSnapshot(query(collection(db, 'foodLogs'), orderBy('createdAt', 'desc')), (snap) => {
    setFoods(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, (err) => setError(`โหลดข้อมูลไม่สำเร็จ: ${err.message}`)), []);

  // โหลดประวัติการจัดการล่าสุดไม่เกิน 10 รายการ
  useEffect(() => onSnapshot(
    query(collection(db, 'adminActivityLogs'), orderBy('createdAt', 'desc'), limit(10)),
    (snap) => setActivity(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    (err) => setError(`โหลดประวัติไม่สำเร็จ: ${err.message}`),
  ), []);

  // กรองรายการตามหมวดหมู่และคำค้นก่อนแสดงในตาราง
  const filtered = useMemo(() => foods.filter((food) => (
    (category === 'ทั้งหมด' || food.category === category)
    && (food.name || '').toLowerCase().includes(search.toLowerCase().trim())
  )), [foods, category, search]);
  // นับจำนวนรายการในแต่ละหมวดเพื่อแสดงการ์ดสรุปบน Dashboard
  const counts = categories.map((item) => ({ item, count: foods.filter((food) => food.category === item).length }));

  // เพิ่มหรือแก้ไขอาหารส่วนกลาง แล้วบันทึกประวัติการเปลี่ยนแปลงของ Admin
  const saveFood = async (data) => {
    const isEdit = Boolean(modal?.id);
    const changes = isEdit ? diffFields(modal, data) : diffFields({}, data);
    try {
      if (isEdit) await updateDoc(doc(db, 'foodLogs', modal.id), { ...data, updatedAt: serverTimestamp() });
      else await addDoc(collection(db, 'foodLogs'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setModal(null);
      await logActivity(isEdit ? 'update' : 'create', data.name, user.email, changes);
      setSuccessDialog(isEdit
        ? { title: 'อัปเดตข้อมูลสำเร็จ', message: `แก้ไขรายการ "${data.name}" เรียบร้อยแล้ว` }
        : { title: 'เพิ่มข้อมูลสำเร็จ', message: `เพิ่มรายการ "${data.name}" เรียบร้อยแล้ว` });
    } catch (err) { setError(`บันทึกไม่สำเร็จ: ${err.message}`); }
  };
  // ลบอาหารหลัง Admin ยืนยัน และบันทึกเหตุการณ์ลงประวัติ
  const confirmRemove = async () => {
    const food = confirmDelete;
    setConfirmDelete(null);
    if (!food) return;
    try {
      await deleteDoc(doc(db, 'foodLogs', food.id));
      await logActivity('delete', food.name, user.email, diffFields(food, {}));
      setSuccessDialog({ title: 'ลบข้อมูลสำเร็จ', message: 'รายการถูกลบออกจากระบบแล้ว' });
    } catch (err) { setError(`ลบไม่สำเร็จ: ${err.message}`); }
  };

  return <div className="app-shell">
    <aside className="sidebar"><div className="sidebar-brand">บันทึกสมดุลแคลอรี่รายวัน<span>Admin Dashboard</span></div><button className={page === 'dashboard' ? 'nav active' : 'nav'} onClick={() => setPage('dashboard')}>📊 ภาพรวมระบบ</button><button className={page === 'foods' ? 'nav active' : 'nav'} onClick={() => setPage('foods')}>🍲 จัดการข้อมูลอาหาร</button><button className="logout" onClick={() => setConfirmLogout(true)}>◼ ออกจากระบบ</button></aside>
    <section className="content"><header><b>{page === 'dashboard' ? 'ภาพรวมระบบ (Dashboard)' : 'จัดการข้อมูลอาหาร'}</b><span>แอดมินระบบ <i>● Online</i> <span className="avatar">👤</span></span></header>
      {error && <div className="notice">{error}<button onClick={() => setError('')}>×</button></div>}
      {page === 'dashboard' ? <><div className="welcome"><div><h1>สวัสดี, แอดมิน 👋</h1><p>สรุปข้อมูลรายการอาหารและประวัติการทำรายการของคุณ</p></div><button className="primary-button" onClick={() => { setPage('foods'); setModal({}); }}>+ เพิ่มอาหารใหม่</button></div><div className="stats"><div><span>🍽️</span><p>อาหารทั้งหมดในระบบ<strong>{foods.length}</strong></p></div>{counts.slice(0, 3).map(({ item, count }) => <div key={item}><span>🥗</span><p>{item}<strong>{count}</strong></p></div>)}</div><section className="activity"><h2>ประวัติการดำเนินการล่าสุด</h2>{activity.length ? activity.map((log) => { const meta = actionLabels[log.action] || { icon: '📝', text: 'ดำเนินการ' }; return <button type="button" className="activity-row" key={log.id} onClick={() => setViewLog(log)}>{meta.icon} <span>{meta.text} <b>"{log.foodName}"</b><small>โดย {log.adminEmail || 'แอดมินระบบ'}</small></span><time>{formatLogTime(log.createdAt)}</time></button>; }) : <p className="empty">ยังไม่มีประวัติการดำเนินการ</p>}</section></> : <section className="foods-panel"><div className="panel-tools"><input placeholder="ค้นหาอาหาร..." value={search} onChange={(e) => setSearch(e.target.value)} /><select value={category} onChange={(e) => setCategory(e.target.value)}><option>ทั้งหมด</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><button className="primary-button" onClick={() => setModal({})}>+ เพิ่มอาหาร</button></div><table><thead><tr><th>ชื่ออาหาร</th><th>หมวดหมู่</th><th>แคลอรี่</th><th>การจัดการ</th></tr></thead><tbody>{filtered.map((food) => <tr key={food.id}><td>{food.name}</td><td>{food.category}</td><td>{food.calories} kcal</td><td><button className="table-action" onClick={() => setModal(food)}>แก้ไข</button><button className="delete-action" onClick={() => setConfirmDelete(food)}>ลบ</button></td></tr>)}</tbody></table>{!filtered.length && <p className="empty">ไม่พบรายการอาหาร</p>}</section>}
    </section>{modal && <div className="modal-backdrop"><FoodForm initial={modal.id ? modal : null} onClose={() => setModal(null)} onSave={saveFood} /></div>}
    {confirmDelete && <Dialog
      tone="danger"
      icon="🚨"
      title="ยืนยันการลบข้อมูล?"
      message={`คุณกำลังจะลบ "${confirmDelete.name}" ออกจากระบบ ไม่สามารถกู้คืนได้`}
      cancelLabel="ยกเลิก"
      confirmLabel="ยืนยัน"
      onCancel={() => setConfirmDelete(null)}
      onConfirm={confirmRemove}
    />}
    {confirmLogout && <Dialog
      tone="warning"
      icon="⚠️"
      title="ออกจากระบบ?"
      message="คุณต้องการออกจากระบบผู้ดูแลใช่หรือไม่"
      cancelLabel="ยกเลิก"
      confirmLabel="ยืนยัน"
      onCancel={() => setConfirmLogout(false)}
      onConfirm={() => { setConfirmLogout(false); signOut(auth); }}
    />}
    {successDialog && <Dialog
      tone="success"
      icon="✨"
      title={successDialog.title}
      message={successDialog.message}
      confirmLabel="ตกลง"
      onConfirm={() => setSuccessDialog(null)}
    />}
    {viewLog && <div className="modal-backdrop"><div className="modal-card">
      <div className="modal-heading"><h2>{(actionLabels[viewLog.action] || {}).text || 'รายละเอียด'}</h2><button type="button" className="icon-button" onClick={() => setViewLog(null)}>×</button></div>
      <p className="log-detail-food">รายการ: <b>{viewLog.foodName}</b></p>
      <p className="log-detail-meta">โดย {viewLog.adminEmail || 'แอดมินระบบ'} · {formatLogTime(viewLog.createdAt)}</p>
      {viewLog.changes && viewLog.changes.length
        ? <table className="log-detail-table"><thead><tr><th>ฟิลด์</th><th>ก่อนแก้ไข</th><th>หลังแก้ไข</th></tr></thead><tbody>
          {viewLog.changes.map((change) => <tr key={change.field}>
            <td>{change.label}</td>
            <td>{change.before === undefined || change.before === '' ? '—' : String(change.before)}</td>
            <td>{change.after === undefined || change.after === '' ? '—' : String(change.after)}</td>
          </tr>)}
        </tbody></table>
        : <p className="empty">ไม่มีรายละเอียดการเปลี่ยนแปลง</p>}
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setViewLog(null)}>ปิด</button></div>
    </div></div>}
  </div>;
}

// ตรวจสถานะ Firebase Auth แล้วเลือกแสดงหน้าเข้าสู่ระบบหรือ Dashboard
export default function App() {
  const [user, setUser] = useState(undefined);
  // คืนสถานะล็อกอินจาก Firebase เพื่อเลือกแสดงหน้า Login หรือ Dashboard
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  if (user === undefined) return <div className="loading">กำลังตรวจสอบสิทธิ์...</div>;
  return user ? <Dashboard user={user} /> : <Login onLogin={setUser} />;
}
