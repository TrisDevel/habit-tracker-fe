import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import DetailsScreen from "../screens/DetailsScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AddHabitScreen from "../screens/AddHabitScreen";
import HabitDetailScreen from "../screens/HabitDetailScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: "Statistics",
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          title: "Details",
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="AddHabit"
        component={AddHabitScreen}
        options={{
          title: "Add Habit",
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="HabitDetail"
        component={HabitDetailScreen}
        options={{
          title: "Habit Detail",
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
