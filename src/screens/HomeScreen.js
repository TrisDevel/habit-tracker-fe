import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { habitApi } from "../services/api";
import HabitCard from "../components/HabitCard";
import { getHabits, saveHabits } from "../utils/storage";
import MiniCalendarWidget from "../components/MiniCalenderWidget";

const HomeScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Xử lý ghim/bỏ ghim thói quen
  const handleTogglePin = async (habitId) => {
    try {
      const updatedHabits = habits.map((habit) =>
        habit._id === habitId ? { ...habit, pinned: !habit.pinned } : habit
      );
      setHabits(updatedHabits);
      await saveHabits(updatedHabits);
    } catch (error) {
      console.error("Error updating pin status:", error);
    }
  };

  const fetchHabits = async (showFullLoading = true) => {
    if (showFullLoading) setLoading(true);
    setError(null);

    try {
      const data = await habitApi.getAllHabits();
      // Đảm bảo tất cả thói quen đều có thuộc tính pinned
      const habitsWithPinned = data.map((habit) => ({
        ...habit,
        pinned: habit.pinned || false, // Thêm thuộc tính pinned nếu chưa có
      }));
      setHabits(habitsWithPinned);
    } catch (error) {
      setError(error.toString());
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchHabits(false);
  };

  // Fetch habits when the component mounts
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchHabits();
    });

    return unsubscribe;
  }, [navigation]);
  const renderItem = ({ item }) => (
    <HabitCard
      habit={item}
      onPress={() =>
        navigation.navigate("HabitDetail", {
          habitId: item._id || item.id,
          onPinToggled: handleTogglePin,
        })
      }
      onTogglePin={() => handleTogglePin(item._id || item.id)}
    />
  );

  // Sắp xếp thói quen: đưa những thói quen được ghim lên đầu danh sách
  const sortedHabits = [...habits].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1; // a được ghim, b không -> a lên đầu
    if (!a.pinned && b.pinned) return 1; // b được ghim, a không -> b lên đầu
    return 0; // không thay đổi thứ tự
  });

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading habits...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchHabits()}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedHabits}
          renderItem={renderItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          // Add performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddHabit")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <MiniCalendarWidget habits={habits} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    fontSize: 32,
    color: "#fff",
    marginTop: -2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  retryText: {
    color: "white",
  },
});

export default HomeScreen;
