import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./src/screens/HomeScreen";
import AddHabitScreen from "./src/screens/AddHabitScreen";
import HabitDetailScreen from "./src/screens/HabitDetailScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"  
        screenOptions={{
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "My Habits" }}
        />
        <Stack.Screen
          name="AddHabit"
          component={AddHabitScreen}
          options={{ title: "Add New Habit" }}
        />
        <Stack.Screen
          name="HabitDetail"
          component={HabitDetailScreen}
          options={{ title: "Habit Details" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
