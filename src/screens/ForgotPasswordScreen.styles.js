import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 28,
  },
  titleText: {
    fontSize: 28,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: 'Kanit_400Regular',
    color: '#919EAB',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Kanit_500Medium',
    color: '#8E8E93',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBF0F5',
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Kanit_400Regular',
    color: '#161C24',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#FF5722',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Kanit_700Bold',
  },
  // Style ของ Modal แจ้งเตือนสำเร็จ
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 20,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
    marginBottom: 12,
  },
  modalSubtitleText: {
    fontSize: 15,
    fontFamily: 'Kanit_400Regular',
    color: '#919EAB',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalConfirmButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FF5722',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Kanit_700Bold',
  },
});