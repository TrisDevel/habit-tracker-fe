import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import { getHabits, saveHabits, updateHabit } from "../utils/storage";
import { habitApi } from "../services/api";

const HabitDetailScreen = ({ route, navigation }) => {
  const { habitId, onPinToggled } = route.params;
  const [habit, setHabit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSchedule, setEditSchedule] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      const habit = await habitApi.getHabitById(habitId);
      setHabit(habit);
    } catch (error) {
      console.error("Error fetching habit details:", error);
      setError(error.toString());
      Alert.alert("Error", "Failed to load habit details. Please try again.", [
        {
          text: "Retry",
          onPress: () => fetchHabitDetails(),
        },
        {
          text: "Go Back",
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchHabitDetails();
  };

  // Xử lý ghim/bỏ ghim thói quen
  const handleTogglePin = async () => {
    try {
      // Cập nhật UI ngay lập tức
      const updatedHabit = { ...habit, pinned: !habit.pinned };
      setHabit(updatedHabit);

      // Cập nhật trong storage
      const habits = await getHabits();
      const updatedHabits = habits.map((h) =>
        h.id === habitId ? updatedHabit : h
      );

      await saveHabits(updatedHabits);

      // Hiển thị thông báo
      Alert.alert(
        "Thành công",
        updatedHabit.pinned ? "Thói quen đã được ghim" : "Đã bỏ ghim thói quen"
      );

      // Gọi callback nếu được truyền từ màn hình Home
      if (route.params?.onPinToggled) {
        route.params.onPinToggled(habitId);
      }
    } catch (error) {
      console.error("Error updating pin status:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái ghim");
    }
  };
  const handleDatePress = async (date) => {
    // Set selected date and show modal with existing note/photo if any
    setSelectedDate(date);
    setNote(habit.notes?.[date] || "");
    setPhoto(habit.photos?.[date]);
    setShowModal(true);
  };

  const handleComplete = async () => {
    try {
      if (!selectedDate) {
        Alert.alert("Error", "No date selected");
        return;
      }

      // Create updated habit data
      const updatedHabit = {
        ...habit,
        notes: {
          ...(habit.notes || {}),
          [selectedDate]: note || undefined, // Only add if note exists
        },
        photos: {
          ...(habit.photos || {}),
          [selectedDate]: photo || undefined, // Only add if photo exists
        },
        completedDates: habit.completedDates.includes(selectedDate)
          ? habit.completedDates.filter((d) => d !== selectedDate)
          : [...habit.completedDates, selectedDate],
      };

      console.log("Sending update:", {
        habitId: habit._id,
        updatedData: updatedHabit,
      });

      // Update in backend
      const response = await habitApi.updateHabit(updatedHabit);

      // Verify response
      if (!response) throw new Error("No response from server");

      console.log("Update response:", response);

      // Update local state with response data
      setHabit(response);

      // Reset form
      setNote("");
      setPhoto(null);
      setSelectedDate(null);
      setShowModal(false);

      // Fetch fresh data
      await fetchHabitDetails();
    } catch (error) {
      console.error("Error updating habit:", error);
      Alert.alert("Error", "Failed to save changes. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions first
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission status:", status);

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to add photos.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Settings",
              onPress: () => {
                // This will open the app settings
                Linking.openSettings();
              },
            },
          ]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log("Selected image:", selectedImage);
        setPhoto(selectedImage.uri);
        Alert.alert("Success", "Photo added successfully!");
      } else {
        console.log("No image selected or picker was canceled");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.", [
        { text: "OK" },
      ]);
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
            await habitApi.deleteHabit(habitId);
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
      const updatedHabit = {
        ...habit,
        name: editName,
        description: editDescription,
        schedule: editSchedule,
      };
      const response = await habitApi.updateHabit(updatedHabit);
      setHabit(response);
      setIsEditing(false);
      Alert.alert("Success", "Habit updated successfully");
    } catch (error) {
      console.error("Error updating habit:", error);
      Alert.alert("Error", "Failed to update habit");
    }
  };

  const handleViewStatistics = () => {
    if (!habit?._id) return;

    navigation.navigate("Statistics", {
      habitId: habit._id,
      habitName: habit.name,
    });
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
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

    console.log("Current habit data:", {
      completedDates: habit.completedDates,
      notes: habit.notes,
      photos: habit.photos,
    });

    return (
      <View>
        <View style={styles.calendarContainer}>
          {dates.map((date) => {
            const dateString = date.toISOString().split("T")[0];
            const isCompleted = habit.completedDates.includes(dateString);
            const hasNote = habit.notes?.[dateString];
            const hasPhoto = habit.photos?.[dateString];

            return (
              <TouchableOpacity
                key={dateString}
                style={[styles.dateButton, isCompleted && styles.completedDate]}
                onPress={() => handleDatePress(dateString)}
              >
                <Text
                  style={[styles.dayText, isCompleted && { color: "#fff" }]}
                >
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
                <Text
                  style={[styles.dateText, isCompleted && { color: "#fff" }]}
                >
                  {date.getDate()}
                </Text>
                {isCompleted && (
                  <View style={styles.indicatorsContainer}>
                    {hasNote && (
                      <View style={[styles.indicator, styles.noteIndicator]} />
                    )}
                    {hasPhoto && (
                      <View style={[styles.indicator, styles.photoIndicator]} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Display saved entries with separate ScrollView */}
        <View style={styles.savedEntriesContainer}>
          <Text style={styles.sectionTitle}>Note/Photo</Text>
          <ScrollView style={styles.recentEntriesScroll}>
            {dates.map((date) => {
              const dateString = date.toISOString().split("T")[0];
              const isCompleted = habit.completedDates.includes(dateString);
              const note = habit.notes?.[dateString];
              const photo = habit.photos?.[dateString];

              if (!isCompleted) return null;

              return (
                <View key={dateString} style={styles.entryContainer}>
                  <Text style={styles.entryDate}>
                    {new Date(dateString).toLocaleDateString()}
                  </Text>
                  {note && <Text style={styles.entryNote}>{note}</Text>}
                  {photo && (
                    <Image source={{ uri: photo }} style={styles.entryPhoto} />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.pinButton} onPress={handleTogglePin}>
          <FontAwesome
            name="thumb-tack"
            size={20}
            color={habit.pinned ? "#2196F3" : "#888"}
            style={habit.pinned ? styles.pinnedIcon : {}}
          />
          <Text style={habit.pinned ? styles.pinnedText : styles.unpinnedText}>
            {habit.pinned ? "Đã ghim" : "Ghim"}
          </Text>
        </TouchableOpacity>
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
            ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, index) => (
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
                )
              )
            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
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

      <TouchableOpacity
        style={[styles.statsButton, !habit && styles.disabledButton]}
        onPress={handleViewStatistics}
        disabled={!habit}
      >
        <Text style={styles.statsButtonText}>View Statistics</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Habit</Text>
      </TouchableOpacity>
      {isEditing ? (
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Save Changes</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.updateButtonText}>Update Habit</Text>
        </TouchableOpacity>
      )}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString() : ""}
            </Text>

            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              multiline
            />

            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Text style={styles.photoButtonText}>
                {photo ? "Change Photo" : "Add Photo"}
              </Text>
            </TouchableOpacity>

            {photo && (
              <Image source={{ uri: photo }} style={styles.photoPreview} />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.completeButton]}
                onPress={handleComplete}
              >
                <Text style={styles.modalButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "column",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: "#2196F3",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  statsButton: {
    margin: 16,
    padding: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    alignItems: "center",
  },
  statsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  noteInput: {
    height: 100,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  photoButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  photoButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ff5252",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  noteIndicator: {
    backgroundColor: "#4CAF50",
  },
  photoIndicator: {
    backgroundColor: "#2196F3",
  },
  savedEntriesContainer: {
    padding: 16,
    height: 300, // Chiều cao cố định cho container
  },
  recentEntriesScroll: {
    flex: 1,
  },
  entryContainer: {
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  entryNote: {
    fontSize: 14,
    color: "#666",
  },
  entryPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  pinButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    padding: 8,
    marginBottom: 8,
  },
  pinnedIcon: {
    transform: [{ rotate: "45deg" }],
  },
  pinnedText: {
    marginLeft: 8,
    color: "#2196F3",
    fontWeight: "bold",
  },
  unpinnedText: {
    marginLeft: 8,
    color: "#888",
  },
});

export default HabitDetailScreen;
