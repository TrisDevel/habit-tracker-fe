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
import { getHabits } from "../utils/storage";

const HomeScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setHabits(data);
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
      onPress={() => navigation.navigate("HabitDetail", { habitId: item.id })}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
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
