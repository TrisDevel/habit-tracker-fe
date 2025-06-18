import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

const AuthScreen = ({ navigation }) => {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const DEV_PASSWORD = "123456";

  useEffect(() => {
    startDeviceAuth();
  }, []);

  const startDeviceAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Enter Device Passcode",
        disableDeviceFallback: false,
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
        requireConfirmation: false,
        // Force passcode by disabling biometrics
        supportedAuthenticationTypes: [
          LocalAuthentication.AuthenticationType.PASSCODE,
        ],
      });

      if (result.success) {
        navigation.replace("Home");
      } else {
        setShowPasswordInput(true);
      }
    } catch (error) {
      console.log("Authentication error:", error);
      setShowPasswordInput(true);
    }
  };

  const handlePasswordLogin = () => {
    if (password === DEV_PASSWORD) {
      navigation.replace("Home");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  const retryDeviceAuth = () => {
    setShowPasswordInput(false);
    setError("");
    startDeviceAuth();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit Tracker</Text>
      <Text style={styles.subtitle}>
        {showPasswordInput
          ? "Enter development password"
          : "Use device passcode to continue"}
      </Text>

      {showPasswordInput ? (
        <>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            onSubmitEditing={handlePasswordLogin}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryDeviceAuth}
            >
              <Text style={styles.retryButtonText}>Try Device Passcode</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <ActivityIndicator size="large" color="#4CAF50" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#4CAF50",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  input: {
    width: "80%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputError: {
    borderColor: "#ff5252",
  },
  errorText: {
    color: "#ff5252",
    fontSize: 14,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
    width: "80%",
    marginTop: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
  },
  retryButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    textAlign: "center",
  },
});



export default AuthScreen;
