import axios from "axios";

const API_URL = "http://172.20.10.5:5000/api";

// Create axios instance with better config
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  // Retry logic
  retry: 2,
  retryDelay: 1000,
});

// Add interceptor to handle timeouts
api.interceptors.response.use(undefined, async (error) => {
  const { config, message } = error;

  if (message === "Network Error" || message.includes("timeout")) {
    // Retry request
    if (!config || !config.retry) {
      return Promise.reject(error);
    }

    config.retry -= 1;
    const delayRetryRequest = new Promise((resolve) => {
      setTimeout(resolve, config.retryDelay);
    });

    await delayRetryRequest;
    return api(config);
  }

  return Promise.reject(error);
});

// API functions for habits
export const habitApi = {
  getAllHabits: async () => {
    try {
      const response = await api.get("/habits");
      return response.data;
    } catch (error) {
      if (error.message.includes("timeout")) {
        throw "Request timed out. Please check your connection.";
      }
      throw error.response?.data || "An error occurred while fetching habits";
    }
  },

  // Create a new habit
  addHabit: async (habitData) => {
    try {
      const response = await api.post("/habits", habitData);
      return response.data;
    } catch (error) {
      if (error.message === "Network Error") {
        throw "Unable to connect to server. Please check your internet connection.";
      }
      throw error.response?.data || "An error occurred while adding habit";
    }
  },

  // Update habit completion
  updateHabitCompletion: async (habitId, date) => {
    try {
      // Clean and format the date
      const formattedDate = date.split("T")[0];

      console.log("Sending completion update:", {
        habitId,
        date: formattedDate,
      });

      const response = await api.put(`/habits/${habitId}/completion`, {
        date: formattedDate,
      });

      if (!response.data) {
        throw new Error("No response data received");
      }

      return response.data;
    } catch (error) {
      console.error("Completion update error:", error);
      throw (
        error.response?.data?.message || "Failed to update habit completion"
      );
    }
  },

  // Delete a habit
  deleteHabit: async (habitId) => {
    try {
      const response = await api.delete(`/habits/${habitId}`);
      return response.data;
    } catch (error) {
      if (error.message === "Network Error") {
        throw "Unable to connect to server. Please check your internet connection.";
      }
      throw error.response?.data || "An error occurred while deleting habit";
    }
  },

  // Get habit statistics
  getHabitStats: async (habitId) => {
    try {
      const response = await api.get(`/habits/${habitId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch habit statistics";
    }
  },

  // Get user achievements
  getAchievements: async () => {
    try {
      const response = await api.get("/achievements");
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch achievements";
    }
  },

  // Update habit progress
  updateProgress: async (habitId, progress) => {
    try {
      const response = await api.post(`/habits/${habitId}/progress`, progress);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to update progress";
    }
  },

  // Update an existing habit
  updateHabit: async (habitData) => {
    try {
      console.log("Updating habit:", habitData);

      const response = await api.put(`/habits/${habitData._id}`, habitData);

      if (!response.data) {
        throw new Error("No data received from server");
      }

      console.log("Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Update error:", error.response || error);
      throw error.response?.data?.message || "Failed to update habit";
    }
  },

  // Get single habit by ID
  getHabitById: async (habitId) => {
    try {
      console.log("Fetching habit with ID:", habitId);
      const response = await api.get(`/habits/${habitId}`);

      // Validate response data
      if (!response.data) {
        throw new Error("No data received from server");
      }

      // Ensure required fields exist
      const habit = {
        ...response.data,
        completedDates: response.data.completedDates || [],
        schedule: response.data.schedule || Array(7).fill(false),
        name: response.data.name || "",
        description: response.data.description || "",
        id: response.data._id || response.data.id, // Handle both MongoDB _id and local id
      };

      console.log("Received habit data:", habit);
      return habit;
    } catch (error) {
      console.error("Error fetching habit:", error);
      if (error.message === "Network Error") {
        const cachedData = await getCachedHabits();
        const cachedHabit = cachedData.find(
          (h) => h.id === habitId || h._id === habitId
        );
        if (cachedHabit) return cachedHabit;

        throw "Unable to connect to server. Please check your internet connection.";
      }
      throw error.response?.data?.message || "Failed to fetch habit details";
    }
  },
};



export default api;
