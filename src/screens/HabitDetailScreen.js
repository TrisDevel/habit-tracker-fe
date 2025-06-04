import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getHabits, saveHabits } from "../utils/storage";

const HabitDetailScreen = ({ route, navigation }) => {
  const { habitId } = route.params;
  const [habit, setHabit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSchedule, setEditSchedule] = useState([]);

  useEffect(() => {
    fetchHabitDetails();
  }, []);

  useEffect(() => {
    if (habit) {
      setEditName(habit.name);
      setEditDescription(habit.description);
      setEditSchedule(habit.schedule);
    }
  }, [habit]);

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
            const habits = await getHabits();
            const updatedHabits = habits.filter((h) => h.id !== habitId);
            await saveHabits(updatedHabits);
            Alert.alert("Success", "Habit deleted successfully");
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting habit:", error);
            Alert.alert("Error", "Failed to delete habit");
          }
        },
      },
    ]);
  };

  const handleDayToggle = (index) => {
    const newSchedule = [...editSchedule];
    newSchedule[index] = !newSchedule[index];
    setEditSchedule(newSchedule);
  };

  const handleUpdate = async () => {
    try {
      const updatedHabit = { ...habit, name: editName, description: editDescription, schedule: editSchedule };
      await updateHabit(updatedHabit);
      setHabit(updatedHabit);
      setIsEditing(false);
      Alert.alert("Success", "Habit updated successfully");
    } catch (error) {
      console.error("Error updating habit:", error);
      Alert.alert("Error", "Failed to update habit");
    }
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
        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Habit Name"
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Description"
              multiline
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>{habit.name}</Text>
            <Text style={styles.description}>{habit.description}</Text>
          </>
        )}
      </View>

      <View style={styles.scheduleSection}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        <View style={styles.daysContainer}>
          {isEditing
            ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayIndicator,
                    editSchedule[index] && styles.activeDayIndicator,
                  ]}
                  onPress={() => handleDayToggle(index)}
                >
                  <Text
                    style={[
                      styles.dayIndicatorText,
                      editSchedule[index] && styles.activeDayIndicatorText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))
            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
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
              ))}
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Progress</Text>
        {renderCalendar()}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Habit</Text>
      </TouchableOpacity>
      {isEditing ? (
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Save Changes</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.updateButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.updateButtonText}>Update Habit</Text>
        </TouchableOpacity>
      )}
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
  updateButton: {
    margin: 16,
    padding: 16,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});

export default HabitDetailScreen;
