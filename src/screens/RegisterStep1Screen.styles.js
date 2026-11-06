import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    // ดักเว้นระยะแถบสถานะด้านบนของ Android ไม่ให้ทับกัน
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
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
    marginBottom: 32,
  },
  titleText: {
    fontSize: 28,
    fontFamily: 'Kanit_700Bold', 
    color: '#161C24',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: 'Kanit_400Regular', 
    color: '#919EAB',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 18,
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
  nextButton: {
    height: 52,
    backgroundColor: '#FF5722',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 17,
    fontFamily: 'Kanit_700Bold', 
    color: '#FFFFFF',
  },
});