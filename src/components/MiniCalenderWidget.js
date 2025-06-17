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
import { Calendar } from "react-native-calendars";

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
              <View style={styles.completedList}>
                <Text style={styles.completedTitle}>
                  Đã hoàn thành ngày {selectedDate}
                </Text>
                <FlatList
                  data={getCompletedHabits(selectedDate)}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    return (
                      <Text style={styles.completedItem}>• {item.name}</Text>
                    );
                  }}
                  ListEmptyComponent={
                    <Text style={styles.noCompleted}>
                      Chưa hoàn thành thói quen nào
                    </Text>
                  }
                />
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
  completedList: {
    marginTop: 16,
    marginBottom: 8,
  },
  completedTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  completedItem: {
    fontSize: 15,
    marginBottom: 4,
  },
  noCompleted: {
    color: "#888",
    fontStyle: "italic",
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
