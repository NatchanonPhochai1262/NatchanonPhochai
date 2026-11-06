import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Modal กลางแบบกำหนดหัวข้อ ข้อความ และปุ่มยืนยัน/ยกเลิกจากหน้าที่เรียกใช้
export default function CustomModal({ 
  visible, 
  title, 
  description, 
  onConfirm, 
  onCancel, 
  confirmText = 'ตกลง', 
  cancelText = 'ยกเลิก' 
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {description ? <Text style={styles.desc}>{description}</Text> : null}
          <View style={styles.btnGroup}>
            {onCancel && (
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onCancel}>
                <Text style={styles.textCancel}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.btn, styles.btnConfirm]} onPress={onConfirm}>
              <Text style={styles.textConfirm}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#F1F5F9',
  },
  btnConfirm: {
    backgroundColor: '#FF5722',
  },
  textCancel: {
    color: '#64748B',
    fontWeight: '600',
  },
  textConfirm: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});