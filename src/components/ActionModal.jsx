import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

// Modal กลางสำหรับเลือกบันทึกอาหาร/ออกกำลังกาย หรือแสดงข้อความยืนยันแบบ alert
export default function ActionModal({
  visible,
  onClose,
  onSelectFood,
  onSelectExercise,
  title = 'เลือกรายการที่ต้องการบันทึก',
  message,
  confirmText = 'OK',
  variant = 'action',
}) {
  if (!visible) return null;

  // เลือกแสดงกล่องแจ้งเตือนแบบปุ่มยืนยันหนึ่งปุ่ม หรือเมนูเลือกชนิดการบันทึก
  if (variant === 'alert') {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.alertBackdrop}>
          <View style={styles.alertCard}>
            {message ? <Text style={styles.alertMessage}>{message}</Text> : null}

            <TouchableOpacity style={styles.alertButton} onPress={onClose} activeOpacity={0.9}>
              <Text style={styles.alertButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          <TouchableOpacity style={styles.foodBtn} onPress={onSelectFood}>
            <Text style={styles.foodText}>🍔  บันทึกอาหาร</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exeBtn} onPress={onSelectExercise}>
            <Text style={styles.exeText}>🏃‍♂️  บันทึกการออกกำลังกาย</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  foodBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FF5722',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodText: {
    color: '#FF5722',
    fontSize: 16,
    fontWeight: '700',
  },
  exeBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#00D084',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  exeText: {
    color: '#00D084',
    fontSize: 16,
    fontWeight: '700',
  },
  alertBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  alertCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  alertMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 18,
    textAlign: 'left',
  },
  alertButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E63D6',
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 12,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});