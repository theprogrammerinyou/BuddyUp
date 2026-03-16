import { makeAutoObservable, runInAction } from "mobx";
import * as Location from "expo-location";
import { api } from "@/services/api";
import { User } from "./authStore";

export interface DiscoverUser extends User {
  distance_km: number;
  common_interests: number;
}

class DiscoverStore {
  users: DiscoverUser[] = [];
  currentIndex = 0;
  isLoading = false;
  filterLat?: number;
  filterLng?: number;
  filterRadius = 50;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchDiscover() {
    this.isLoading = true;
    try {
      const params: Record<string, number> = {
        radius_km: this.filterRadius,
      };
      if (this.filterLat != null && this.filterLng != null) {
        params.latitude = this.filterLat;
        params.longitude = this.filterLng;
      } else {
        // No filter set: try device location so discover returns users (e.g. seed profiles)
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const loc = await Location.getCurrentPositionAsync({});
            params.latitude = loc.coords.latitude;
            params.longitude = loc.coords.longitude;
          } else {
            params.latitude = 28.6139;
            params.longitude = 77.209;
          }
        } catch {
          params.latitude = 28.6139;
          params.longitude = 77.209;
        }
      }
      const { data } = await api.get("/discover", { params });
      runInAction(() => {
        this.users = data.users ?? [];
        this.currentIndex = 0;
      });
    } catch (e) {
      console.error("Discover fetch failed", e);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  setFilter(lat: number, lng: number, radius: number) {
    this.filterLat = lat;
    this.filterLng = lng;
    this.filterRadius = radius;
  }

  clearFilter() {
    this.filterLat = undefined;
    this.filterLng = undefined;
    this.filterRadius = 50;
  }

  get currentUser(): DiscoverUser | undefined {
    return this.users[this.currentIndex];
  }

  swipeRight() {
    // Like handled separately, just advance
    this.currentIndex++;
  }

  swipeLeft() {
    this.currentIndex++;
  }
}

export const discoverStore = new DiscoverStore();
