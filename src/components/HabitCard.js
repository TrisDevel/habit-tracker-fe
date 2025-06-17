import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const getLast7Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
};
const HabitCard = ({ habit, onPress }) => {
  const last7Days = getLast7Days();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{habit.name}</Text>
      <Text style={styles.description}>{habit.description}</Text>
      <View style={styles.calendarRow}>
        {last7Days.map((date) => {
          const completed = habit.completedDates?.includes(date);
          return (
            <View
              key={date}
              style={[
                styles.dayCircle,
                completed ? styles.dayCompleted : styles.dayNotCompleted,
              ]}
            >
              <Text style={[styles.dayText, completed && { color: "#fff" }]}>
                {new Date(date).getDate()}
              </Text>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 1,
  },
  dayCompleted: {
    backgroundColor: "#4CAF50",
    color: "#fff",
  },
  dayNotCompleted: {
    backgroundColor: "#eee",
  },
  dayText: {
    color: "#222",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default HabitCard;
