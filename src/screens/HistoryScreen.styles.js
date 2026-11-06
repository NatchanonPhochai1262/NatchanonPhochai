import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  mainTitleText: {
    fontSize: 24,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
    marginBottom: 16,
  },

  /* Segmented Control (รายวัน / ภาพรวม) */
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEFE6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentTextActive: {
    fontSize: 14,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
  },
  segmentTextInactive: {
    fontSize: 14,
    fontFamily: 'Kanit_500Medium',
    color: '#8E8E93',
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  /* ================= 🗓️ STYLES TAB: รายวัน ================= */
  dateSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTitleText: {
    fontSize: 16,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
  },

  gridContainer: {
    gap: 12,
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    minHeight: 85,
    justifyContent: 'center',
  },
  statCardLabel: {
    fontSize: 12,
    fontFamily: 'Kanit_500Medium',
    color: '#8E8E93',
    marginBottom: 6,
  },
  statCardValue: {
    fontSize: 22,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
  },
  orangeValue: {
    color: '#FFA726',
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
    marginBottom: 12,
  },
  emptyListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Kanit_400Regular',
    color: '#8E8E93',
  },
  itemListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemNameText: {
    fontSize: 15,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
  },
  itemCategoryText: {
    fontSize: 12,
    fontFamily: 'Kanit_400Regular',
    color: '#8E8E93',
    marginTop: 2,
  },
  itemCalorieText: {
    fontSize: 15,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
  },
  itemDashedLine: {
    borderWidth: 0.5,
    borderColor: '#EBF0F5',
    borderStyle: 'dashed',
    marginVertical: 4,
  },

  /* ================= 📊 STYLES TAB: ภาพรวม ================= */
  /* Card เผาผลาญสะสมทั้งหมด (ส่วนที่เพิ่มใหม่) */
  totalBurnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE0D1',
  },
  totalBurnIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE4D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  totalBurnTextContainer: {
    flex: 1,
  },
  totalBurnLabel: {
    fontSize: 13,
    color: '#637381',
    marginBottom: 2,
    fontFamily: 'Kanit_500Medium',
  },
  totalBurnValue: {
    fontSize: 22,
    fontFamily: 'Kanit_700Bold',
    color: '#FF5722',
  },
  totalBurnUnit: {
    fontSize: 14,
    fontFamily: 'Kanit_400Regular',
    color: '#919EAB',
  },

  overviewSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  summarySubTitle: {
    fontSize: 13,
    fontFamily: 'Kanit_400Regular',
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryMainTitle: {
    fontSize: 22,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
  },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
    marginBottom: 20,
  },
  chartBarArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
    marginBottom: 16,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 120,
    width: 28,
    justifyContent: 'flex-end',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    fontFamily: 'Kanit_400Regular',
    color: '#637381',
  },

  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Kanit_400Regular',
    color: '#8E8E93',
  },

  /* Bottom Navigation Bar */
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
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
    paddingHorizontal: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Kanit_400Regular',
    color: '#8E8E93',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#FF5722',
    fontFamily: 'Kanit_700Bold',
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  /* Modal Bottom Sheet */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Kanit_700Bold',
    color: '#161C24',
    marginBottom: 24,
  },
  foodOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FF7043',
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
    gap: 8,
  },
  foodOptionText: {
    fontSize: 16,
    fontFamily: 'Kanit_600SemiBold',
    color: '#FF5722',
  },
  exerciseOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#26A69A',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  exerciseOptionText: {
    fontSize: 16,
    fontFamily: 'Kanit_600SemiBold',
    color: '#00897B',
  },
  optionEmoji: {
    fontSize: 18,
  },
});