import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { updateHabit, deleteHabit } from "../services/api";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getHabits, saveHabits } from "../utils/storage";

const HabitDetailScreen = ({ route, navigation }) => {
  const { habitId } = route.params;
  const [habit, setHabit] = useState(null);

  // useEffect(() => {
  //   fetchHabitDetails();
  // }, [fetchHabitDetails]);

  useEffect(() => {
    fetchHabitDetails();
  }, []);

  // const fetchHabitDetails = async () => {
  //   try {
  //     const response = await updateHabit(habitId);
  //     setHabit(response);
  //   } catch (error) {
  //     console.error("Error fetching habit details:", error);
  //     Alert.alert("Error", "Failed to load habit details");
  //   }
  // };

  const fetchHabitDetails = async () => {
    try {
      const habits = await getHabits();
      const foundhabit = habits.find((h) => h.id === habitId);
      setHabit(foundhabit);
    } catch (error) {
      console.error("Error fetching habit details:", error);
      Alert.alert("Error", "Failed to load habit details");
    }
  };

  // const handleDatePress = async (date) => {
  //   try {
  //     const updatedCompletedDates = habit.completedDates.includes(date)
  //       ? habit.completedDates.filter((d) => d !== date)
  //       : [...habit.completedDates, date];

  //     const updatedHabit = {
  //       ...habit,
  //       completedDates: updatedCompletedDates,
  //     };

  //     await updateHabit(habitId, updatedHabit);
  //     setHabit(updatedHabit);
  //   } catch (error) {
  //     console.error("Error updating habit:", error);
  //     Alert.alert("Error", "Failed to update habit");
  //   }
  // };

  const handleDatePress = async (date) => {
    try {
      const updatedCompletedDates = habit.completedDates.includes(date)
        ? habit.completedDates.filter((d) => d !== date)
        : [...habit.completedDates, date];

      const updatedHabit = {
        ...habit,
        completedDates: updatedCompletedDates,
      };

      // Lưu lại vào storage
      const habits = await getHabits();
      const updatedHabits = habits.map((h) =>
        h.id === habitId ? updatedHabit : h
      );
      await saveHabits(updatedHabits);

      setHabit(updatedHabit);
    } catch (error) {
      console.error("Error updating habit:", error);
      Alert.alert("Error", "Failed to update habit");
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete Habit", "Are you sure you want to delete this habit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHabit(habitId);
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting habit:", error);
            Alert.alert("Error", "Failed to delete habit");
          }
        },
      },
    ]);
  };

  if (!habit) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderCalendar = () => {
    const today = new Date();
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }

    return (
      <View style={styles.calendarContainer}>
        {dates.map((date) => {
          const dateString = date.toISOString().split("T")[0];
          const isCompleted = habit.completedDates.includes(dateString);

          return (
            <TouchableOpacity
              key={dateString}
              style={[styles.dateButton, isCompleted && styles.completedDate]}
              onPress={() => handleDatePress(dateString)}
            >
              <Text style={styles.dayText}>
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <Text style={styles.dateText}>{date.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{habit.name}</Text>
        <Text style={styles.description}>{habit.description}</Text>
      </View>

      <View style={styles.scheduleSection}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        <View style={styles.daysContainer}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day, index) => (
              <View
                key={day}
                style={[
                  styles.dayIndicator,
                  habit.schedule[index] && styles.activeDayIndicator,
                ]}
              >
                <Text
                  style={[
                    styles.dayIndicatorText,
                    habit.schedule[index] && styles.activeDayIndicatorText,
                  ]}
                >
                  {day}
                </Text>
              </View>
            )
          )}
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Progress</Text>
        {renderCalendar()}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Habit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
  },
  scheduleSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  activeDayIndicator: {
    backgroundColor: "#4CAF50",
  },
  dayIndicatorText: {
    fontSize: 12,
    color: "#666",
  },
  activeDayIndicatorText: {
    color: "#fff",
  },
  progressSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateButton: {
    width: 45,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  completedDate: {
    backgroundColor: "#4CAF50",
  },
  dayText: {
    fontSize: 12,
    color: "#666",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  deleteButton: {
    margin: 16,
    padding: 16,
    backgroundColor: "#ff5252",
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HabitDetailScreen;
