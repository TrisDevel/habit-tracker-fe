import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

const STORAGE_KEY = "HABITS";

export const getHabits = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);

  if (json !== null) {
    // Đã có dữ liệu trong AsyncStorage → dùng luôn
    return JSON.parse(json);
  } else {
    // Chưa có dữ liệu → đọc từ file habits.json trong assets
    // const asset = Asset.fromModule(require("../../assets/habits.json"));
    // await asset.downloadAsync();

    // const fileUri = asset.localUri; // Đường dẫn nội bộ tới file JSON
    // const content = await FileSystem.readAsStringAsync(fileUri); // đọc file như chuỗi
    // const parsed = JSON.parse(content); // chuyển thành object JS
    // await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); // lưu vào storage
    // return parsed;

    const habits = require("../../assets/habits.json"); //đã có file habits.json trong assets
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); // lưu vào AsyncStorage
    return habits; // trả về dữ liệu đã đọc
  }
};

export const saveHabits = async (habits) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
};
