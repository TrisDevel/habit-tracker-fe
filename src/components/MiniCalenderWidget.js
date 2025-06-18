import { BlurView } from "expo-blur";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { formatDate } from "../utils/date";
LocaleConfig.locales["vi"] = {
  monthNames: [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ],
  monthNamesShort: [
    "Th1",
    "Th2",
    "Th3",
    "Th4",
    "Th5",
    "Th6",
    "Th7",
    "Th8",
    "Th9",
    "Th10",
    "Th11",
    "Th12",
  ],
  dayNames: [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ],
  dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  today: "Hôm nay",
};
LocaleConfig.defaultLocale = "vi";

const MiniCalendarWidget = ({ habits }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // object đánh dấu ngày hoàn thành
  const markedDates = {};
  habits.forEach((habit) => {
    habit.completedDates?.forEach((date) => {
      if (!markedDates[date]) markedDates[date] = { marked: true, dots: [] };
      markedDates[date].marked = true;
      markedDates[date].dots.push({ color: "#4CAF50" });
    });
  });
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: "#2196F3",
    };
  }

  // lấy danh sách hoàn thành
  const getCompletedHabits = (date) => {
    return habits.filter((habit) => habit.completedDates?.includes(date));
  };

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome name="calendar" size={24} color="white" />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Calendar
              markedDates={markedDates}
              markingType={"multi-dot"}
              onDayPress={(day) => setSelectedDate(day.dateString)}
            />
            {selectedDate && (
              <View style={styles.completedListWrapper}>
                <BlurView
                  intensity={60}
                  tint="light"
                  style={styles.completedList}
                >
                  <Text style={styles.completedTitle}>
                    Đã hoàn thành ngày {formatDate(selectedDate)}
                  </Text>
                  <FlatList
                    data={getCompletedHabits(selectedDate)}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.completedItemCard}>
                        <View style={styles.iconCircle}>
                          <FontAwesome name="check" size={16} color="#fff" />
                        </View>
                        <Text style={styles.completedItemText}>
                          {item.name}
                        </Text>
                      </View>
                    )}
                    ItemSeparatorComponent={() => (
                      <View style={styles.separator} />
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyBox}>
                        <FontAwesome name="frown-o" size={22} color="#B0BEC5" />
                        <Text style={styles.noCompleted}>
                          Chưa hoàn thành thói quen nào
                        </Text>
                      </View>
                    }
                  />
                </BlurView>
              </View>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    zIndex: 100,
  },
  fabText: {
    fontSize: 28,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "90%",
    maxHeight: "80%",
  },
  completedListWrapper: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  completedList: {
    backgroundColor: "#F3FAF7",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  completedTitle: {
    fontWeight: "bold",
    marginBottom: 12,
    fontSize: 17,
    color: "#2196F3",
    textAlign: "center",
  },
  completedItemCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  completedItemText: {
    fontSize: 15,
    color: "#333",
  },
  separator: {
    height: 8,
  },
  emptyBox: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  noCompleted: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MiniCalendarWidget;
