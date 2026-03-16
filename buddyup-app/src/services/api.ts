import axios from "axios";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = storage.getString("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      storage.delete("auth_token");
      storage.delete("user");
    }
    return Promise.reject(err);
  }
);

export const authStorage = {
  setToken: (token: string) => storage.set("auth_token", token),
  getToken: () => storage.getString("auth_token"),
  clearToken: () => storage.delete("auth_token"),
  setUser: (user: object) => storage.set("user", JSON.stringify(user)),
  getUser: () => {
    const s = storage.getString("user");
    return s ? JSON.parse(s) : null;
  },
  clear: () => {
    storage.delete("auth_token");
    storage.delete("user");
  },
};
