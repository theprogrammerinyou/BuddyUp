import axios from "axios";
import { createStorage } from "@/utils/storage";

const storage = createStorage();

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

  // Groups
  createGroup: (data: object) => api.post("/groups", data),
  listGroups: (params?: { activity_type?: string; limit?: number; offset?: number }) =>
    api.get("/groups", { params }),
  getGroup: (id: string) => api.get(`/groups/${id}`),
  updateGroup: (id: string, data: object) => api.put(`/groups/${id}`, data),
  deleteGroup: (id: string) => api.delete(`/groups/${id}`),
  joinGroup: (id: string) => api.post(`/groups/${id}/join`),
  leaveGroup: (id: string) => api.post(`/groups/${id}/leave`),
  getGroupMembers: (id: string) => api.get(`/groups/${id}/members`),
  getMyGroups: () => api.get("/me/groups"),

  // Posts (Bulletin Board)
  createPost: (data: object) => api.post("/posts", data),
  listPosts: (params?: {
    activity_type?: string;
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    limit?: number;
    offset?: number;
  }) => api.get("/posts", { params }),
  getPost: (id: string) => api.get(`/posts/${id}`),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  respondToPost: (id: string, message: string) =>
    api.post(`/posts/${id}/respond`, { message }),
  getPostResponses: (id: string) => api.get(`/posts/${id}/responses`),
  getMyPosts: () => api.get("/me/posts"),

  // Events
  createEvent: (data: object) => api.post("/events", data),
  listEvents: (params?: {
    activity_type?: string;
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    from_time?: string;
    limit?: number;
    offset?: number;
  }) => api.get("/events", { params }),
  getEvent: (id: string) => api.get(`/events/${id}`),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
  rsvpEvent: (id: string, status: string) => api.post(`/events/${id}/rsvp`, { status }),
  getEventRSVPs: (id: string) => api.get(`/events/${id}/rsvps`),
  getMyEvents: () => api.get("/me/events"),

  // Social
  blockUser: (id: string) => api.post(`/users/${id}/block`),
  unblockUser: (id: string) => api.delete(`/users/${id}/block`),
  getBlockedUsers: () => api.get("/me/blocked"),
  reportUser: (id: string, reason: string, details?: string) =>
    api.post(`/users/${id}/report`, { reason, details }),
  sendSuperConnect: (receiverId: string, message?: string) =>
    api.post("/super-connects", { receiver_id: receiverId, message }),
  getSuperConnectsReceived: () => api.get("/me/super-connects"),
  setGhostMode: (isDiscoverable: boolean) =>
    api.put("/me/ghost-mode", { is_discoverable: isDiscoverable }),
  setVibeTags: (tags: string[]) => api.put("/me/vibe-tags", { tags }),
  setTravelMode: (latitude: number, longitude: number, expires_hours?: number) =>
    api.put("/me/travel-mode", { latitude, longitude, expires_hours }),
  clearTravelMode: () => api.delete("/me/travel-mode"),

  // Phase 3 — XP, Leaderboard, Challenges, Personas, Social
  getMyXP: () => api.get("/me/xp"),
  getLeaderboard: (params?: { city?: string; period?: string }) =>
    api.get("/leaderboard", { params }),
  getChallenges: () => api.get("/challenges"),
  completeChallenge: (id: string) => api.post(`/challenges/${id}/complete`),
  getMyPersonas: () => api.get("/me/personas"),
  createPersona: (data: object) => api.post("/me/personas", data),
  activatePersona: (id: string) => api.put(`/me/personas/${id}/activate`),
  addVisitedCity: (data: { city_name: string; country_code?: string }) =>
    api.post("/me/visited-cities", data),
  getVisitedCities: (userId: string) => api.get(`/users/${userId}/visited-cities`),
  vouchForUser: (id: string) => api.post(`/users/${id}/vouch`),
  getVouches: (id: string) => api.get(`/users/${id}/vouches`),
  getBadges: (id: string) => api.get(`/users/${id}/badges`),

  // Phase 4 — Premium / Subscription
  getSubscription: () => api.get("/me/subscription"),
  verifySubscription: (data: { provider: string; receipt: string; plan: string }) =>
    api.post("/me/subscription/verify", data),
  activateBoost: () => api.post("/me/boost"),
  getBoostStatus: () => api.get("/me/boost"),
  purchaseSuperLikePack: (data: {
    provider: string;
    transaction_id: string;
    quantity: number;
  }) => api.post("/me/super-like-packs", data),
};
