import { makeAutoObservable, runInAction } from "mobx";
import { api, authStorage } from "@/services/api";
import { registerForPushAndSync } from "@/services/notifications";

function normalizeAuthError(error: unknown, fallback: string): string {
  const raw =
    (error as any)?.response?.data?.error ??
    (error as any)?.message ??
    "";

  const msg = String(raw).toLowerCase();
  if (
    msg.includes("users_email_key") ||
    (msg.includes("duplicate") && msg.includes("email")) ||
    msg.includes("email already")
  ) {
    return "This email is already registered. Please log in or use another email.";
  }

  return String(raw || fallback);
}

export interface Character {
  id: number;
  name: string;
  type: "anime" | "movie" | "book";
  franchise: string;
  image_url: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_character_id?: number;
  avatar?: Character;
  interests: string[];
  latitude?: number;
  longitude?: number;
}

class AuthStore {
  user: User | null = null;
  token: string | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.hydrate();
  }

  hydrate() {
    this.token = authStorage.getToken() ?? null;
    this.user = authStorage.getUser();
  }

  get isAuthenticated() {
    return !!this.token && !!this.user;
  }

  async register(payload: {
    email: string;
    password: string;
    display_name: string;
    bio?: string;
    avatar_character_id?: number;
    interests: string[];
    latitude?: number;
    longitude?: number;
  }) {
    this.isLoading = true;
    this.error = null;
    try {
      const { data } = await api.post("/auth/register", payload);
      runInAction(() => {
        this.token = data.token;
        this.user = data.user;
      });
      authStorage.setToken(data.token);
      authStorage.setUser(data.user);
      registerForPushAndSync();
    } catch (e: any) {
      runInAction(() => {
        this.error = normalizeAuthError(e, "Registration failed");
      });
      throw e;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async login(email: string, password: string) {
    this.isLoading = true;
    this.error = null;
    try {
      const { data } = await api.post("/auth/login", { email, password });
      runInAction(() => {
        this.token = data.token;
        this.user = data.user;
      });
      authStorage.setToken(data.token);
      authStorage.setUser(data.user);
      registerForPushAndSync();
    } catch (e: any) {
      runInAction(() => {
        this.error = normalizeAuthError(e, "Login failed");
      });
      throw e;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    authStorage.clear();
  }
}

export const authStore = new AuthStore();
