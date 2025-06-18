import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { habitApi } from "../services/api";
import { aiService } from "../services/aiService";

const StatisticsScreen = ({ route }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const { habitId, habitName } = route.params || {};

  useEffect(() => {
    fetchStats();
  }, [habitId]);

  useEffect(() => {
    if (stats) {
      fetchAiInsights();
    }
  }, [stats]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await habitApi.getHabitStats(habitId);
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async () => {
    if (!stats) return;

    setLoadingInsights(true);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 5000)
    );

    try {
      const insights = await Promise.race([
        aiService.getHabitInsights({
          name: habitName,
          completionRate: stats.completionRate,
          currentStreak: stats.currentStreak,
        }),
        timeoutPromise,
      ]);
      setAiInsights(insights);
    } catch (error) {
      setAiInsights("Loading insights timed out. Tap to retry.");
    } finally {
      setLoadingInsights(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{habitName}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Current Streak</Text>
          <Text style={styles.statValue}>{stats?.currentStreak || 0}</Text>
          <Text style={styles.statUnit}>days</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Best Streak</Text>
          <Text style={styles.statValue}>{stats?.bestStreak || 0}</Text>
          <Text style={styles.statUnit}>days</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Completion Rate</Text>
          <Text style={styles.statValue}>{stats?.completionRate || 0}</Text>
          <Text style={styles.statUnit}>%</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Days</Text>
          <Text style={styles.statValue}>{stats?.totalDays || 0}</Text>
          <Text style={styles.statUnit}>completed</Text>
        </View>
      </View>

      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>AI Insights</Text>
        {loadingInsights ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : (
          <Text style={styles.insightsText}>
            {aiInsights || "No insights available"}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: "48%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  statUnit: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 16,
  },
  insightsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  insightsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default StatisticsScreen;
