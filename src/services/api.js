import axios from "axios";

// Base URL for the API - replace with your backend URL
const API_URL = "http://localhost:5000/api"; // Using 10.0.2.2 for Android Emulator to access localhost

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API functions for habits
export const habitApi = {
  // Get all habits
  getAllHabits: async () => {
    try {
      const response = await api.get("/habits");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new habit
  addHabit: async (habitData) => {
    try {
      const response = await api.post("/habits", habitData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update habit completion
  updateHabitCompletion: async (habitId, date) => {
    try {
      const response = await api.put(`/habits/${habitId}`, { date });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a habit
  deleteHabit: async (habitId) => {
    try {
      const response = await api.delete(`/habits/${habitId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;
