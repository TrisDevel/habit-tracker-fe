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

  // Xử lý khi người dùng ghim/bỏ ghim thói quen
  const handleTogglePin = async (habitId) => {
    // Cập nhật UI ngay lập tức
    const updatedHabits = habits.map((habit) =>
      habit.id === habitId ? { ...habit, pinned: !habit.pinned } : habit
    );

    setHabits(updatedHabits);

    // Lưu lại trạng thái đã cập nhật
    try {
      await saveHabits(updatedHabits);
    } catch (error) {
      console.error("Error updating pin status:", error);
    }
  };

  // const fetchHabits = async () => {
  //   try {
  //     const data = await habitApi.getAllHabits();
  //     setHabits(data);
  //   } catch (error) {
  //     console.error("Error fetching habits:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const data = await getHabits();
      // Đảm bảo tất cả thói quen đều có thuộc tính pinned
      const habitsWithPinnedProperty = data.map((habit) => ({
        ...habit,
        pinned: habit.pinned || false, // Thêm thuộc tính pinned nếu chưa có
      }));

      // Lưu lại dữ liệu đã cập nhật
      await saveHabits(habitsWithPinnedProperty);

      setHabits(habitsWithPinnedProperty);
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
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
          habitId: item.id,
          onPinToggled: handleTogglePin,
        })
      }
      onTogglePin={() => handleTogglePin(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }
  // Sắp xếp thói quen: đưa những thói quen được ghim lên đầu danh sách
  const sortedHabits = [...habits].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1; // a được ghim, b không -> a lên đầu
    if (!a.pinned && b.pinned) return 1; // b được ghim, a không -> b lên đầu
    return 0; // không thay đổi thứ tự
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedHabits}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
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
});

export default HomeScreen;
