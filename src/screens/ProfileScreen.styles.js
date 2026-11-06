import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
  },

  // Header
  headerTitle: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 24,
    color: '#222831',
    marginBottom: 20,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 28,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  userNameText: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 22,
    color: '#161C24',
    marginBottom: 6,
  },
  userGoalText: {
    fontFamily: 'Kanit_400Regular',
    fontSize: 15,
    color: '#8E8E93',
  },
  goalHighlightText: {
    fontFamily: 'Kanit_700Bold',
    color: '#FF5722',
  },

  // Stats Section
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 17,
    color: '#161C24',
  },
  editIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF0ED',
  },
  editIconButtonText: {
    fontFamily: 'Kanit_600SemiBold',
    fontSize: 13,
    color: '#FF5722',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 28,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  statLabel: {
    fontFamily: 'Kanit_600SemiBold',
    fontSize: 15,
    color: '#161C24',
  },
  statValue: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 15,
    color: '#161C24',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F4F6F8',
    width: '100%',
  },

  // Logout Button
  logoutButton: {
    borderWidth: 1.5,
    borderColor: '#FF5722',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logoutButtonText: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 16,
    color: '#FF5722',
  },

  // Bottom Tab Bar (ปรับความสูงเป็น 70 เท่ากับหน้า Home)
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontFamily: 'Kanit_400Regular',
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#FF5722',
    fontFamily: 'Kanit_600SemiBold',
  },
  plusButtonOuter: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  // Logout Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  confirmModalTitle: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 20,
    color: '#161C24',
    marginBottom: 10,
  },
  confirmModalDesc: {
    fontFamily: 'Kanit_400Regular',
    fontSize: 15,
    color: '#637381',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmModalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#EAEFF5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Kanit_600SemiBold',
    fontSize: 16,
    color: '#454F5B',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#FF5722',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: 'Kanit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Edit Profile Modal
  editModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  editInputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  editInputLabel: {
    fontFamily: 'Kanit_600SemiBold',
    fontSize: 14,
    color: '#454F5B',
    marginBottom: 8,
  },
  editInput: {
    width: '100%',
    backgroundColor: '#F4F6F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Kanit_400Regular',
    fontSize: 15,
    color: '#161C24',
  },
  editSelectButton: {
    width: '100%',
    backgroundColor: '#F4F6F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editSelectButtonText: {
    flex: 1,
    fontFamily: 'Kanit_400Regular',
    fontSize: 15,
    color: '#161C24',
    marginRight: 8,
  },

  // Activity Picker Modal
  pickerModalCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8',
  },
  optionText: {
    fontFamily: 'Kanit_400Regular',
    fontSize: 15,
    color: '#161C24',
    textAlign: 'center',
  },
});