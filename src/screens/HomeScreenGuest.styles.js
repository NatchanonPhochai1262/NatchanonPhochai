import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },

  // --- Header Section ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  greetingText: {
    fontSize: 13,
    color: '#919EAB',
    marginBottom: 3,
    fontFamily: 'Kanit_400Regular',
  },
  titleText: {
    fontSize: 22,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
    letterSpacing: -0.3,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBDD',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  infoBadgeText: {
    fontSize: 12,
    fontFamily: 'Kanit_600SemiBold',
    color: '#FF6B00',
    marginLeft: 4,
  },

  // --- Banner Section ---
  guestBanner: {
    backgroundColor: '#FF9F00',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
    shadowColor: '#FF9F00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerLeft: {
    flex: 1,
    marginRight: 12,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 15,
    fontFamily: 'Kanit_600SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  bannerSubtitle: {
    fontSize: 12,
    fontFamily: 'Kanit_400Regular',
    color: '#FFFFFF',
    opacity: 0.95,
    lineHeight: 17,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 13,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
    textAlign: 'center',
    lineHeight: 16,
  },

  // --- Main Card ---
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginBottom: 22,
    shadowColor: '#919EAB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Kanit_600SemiBold',
    color: '#161C24',
    textAlign: 'center',
    marginBottom: 18,
  },

  // Circle Meter
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  outerCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 15,
    borderColor: '#EBF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieValue: {
    fontSize: 38,
    fontFamily: 'Kanit_700Bold',
    color: '#637381',
  },
  calorieSubtext: {
    fontSize: 12,
    fontFamily: 'Kanit_400Regular',
    color: '#919EAB',
    marginTop: 2,
  },

  // Dashed Box
  dashedBox: {
    borderWidth: 1.2,
    borderColor: '#D8E0E9',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 20,
    backgroundColor: '#FAFAFC',
  },
  dashedText: {
    fontSize: 12,
    fontFamily: 'Kanit_400Regular',
    color: '#637381',
    marginLeft: 10,
    flex: 1,
    lineHeight: 17,
  },

  divider: {
    height: 1,
    backgroundColor: '#F4F6F8',
    marginBottom: 18,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Kanit_400Regular',
    color: '#919EAB',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 17,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
    marginBottom: 14,
  },

  // --- Bottom Tab Bar ---
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F4F6F8',
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Kanit_400Regular',
    marginTop: 4,
    color: '#919EAB',
  },
  tabLabelActive: {
    color: '#FF5722',
    fontFamily: 'Kanit_600SemiBold',
  },
  plusButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});           