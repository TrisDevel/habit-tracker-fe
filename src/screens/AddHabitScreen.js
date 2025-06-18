import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { habitApi } from "../services/api";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AddHabitScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState(Array(7).fill(false));
  const [loading, setLoading] = useState(false);

  const toggleDay = (index) => {
    const newSchedule = [...schedule];
    newSchedule[index] = !newSchedule[index];
    setSchedule(newSchedule);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    if (!schedule.some((day) => day)) {
      Alert.alert("Error", "Please select at least one day");
      return;
    }

    try {
      setLoading(true);
      const habitData = {
        name,
        description,
        schedule,
        completedDates: [],
        notes: {},
        photos: {}
      };

      await habitApi.addHabit(habitData);
      Alert.alert("Success", "Habit created successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create habit. Please try again.");
      console.error("Error creating habit:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Habit Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter habit name"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Schedule</Text>
        <View style={styles.scheduleContainer}>
          {DAYS_OF_WEEK.map((day, index) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                schedule[index] && styles.dayButtonActive,
              ]}
              onPress={() => toggleDay(index)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  schedule[index] && styles.dayButtonTextActive,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Habit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  scheduleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  dayButton: {
    width: "13%",
    paddingVertical: 8,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dayButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  dayButtonText: {
    fontSize: 12,
    color: "#666",
  },
  dayButtonTextActive: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddHabitScreen;
