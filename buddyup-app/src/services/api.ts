import axios from "axios";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

export const API_BASE_URL = "http://localhost:8080";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
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

// ─── Typed API methods ────────────────────────────────────────────────────────

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  email: string; password: string; display_name: string;
  bio?: string; avatar_character_id?: number; interests: string[];
  latitude?: number; longitude?: number;
}
export interface UpdateProfilePayload {
  display_name?: string; bio?: string;
  interests?: string[]; avatar_character_id?: number;
}
export interface UpdateLocationPayload { latitude: number; longitude: number }
export interface DiscoverParams {
  latitude?: number; longitude?: number; radius_km?: number;
}

export const apiService = {
  login: (payload: LoginPayload) => api.post("/auth/login", payload),
  register: (payload: RegisterPayload) => api.post("/auth/register", payload),
  getMe: () => api.get("/me"),
  updateProfile: (payload: UpdateProfilePayload) => api.put("/me", payload),
  updatePushToken: (token: string) => api.put("/auth/push-token", { token }),
  discover: (params: DiscoverParams) => api.get("/discover", { params }),
  like: (likedId: string) => api.post("/likes", { liked_id: likedId }),
  pass: (passedId: string) => api.post("/passes", { passed_id: passedId }),
  getMatches: () => api.get("/matches"),
  whoLikedMe: () => api.get("/likes/me"),
  getChatHistory: (matchId: string) => api.get(`/chats/${matchId}`),
  updateLocation: (payload: UpdateLocationPayload) => api.put("/location", payload),
  getCharacters: () => api.get("/characters"),
  getUserProfile: (userId: string) => api.get(`/users/${userId}`),
};
