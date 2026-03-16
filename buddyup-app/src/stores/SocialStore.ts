import { makeAutoObservable, runInAction } from "mobx";
import { apiService } from "@/services/api";
import { BlockedUser, SuperConnect } from "@/types";

class SocialStore {
  blockedUsers: BlockedUser[] = [];
  superConnectsReceived: SuperConnect[] = [];
  isGhostMode = false;
  vibeTags: string[] = [];
  isTravelModeActive = false;
  dailySuperConnectsSent = 0;
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchBlockedUsers() {
    this.isLoading = true;
    try {
      const { data } = await apiService.getBlockedUsers();
      runInAction(() => {
        this.blockedUsers = data.blocked_users ?? [];
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async blockUser(id: string) {
    await apiService.blockUser(id);
  }

  async unblockUser(id: string) {
    await apiService.unblockUser(id);
    runInAction(() => {
      this.blockedUsers = this.blockedUsers.filter((u) => u.id !== id);
    });
  }

  async reportUser(id: string, reason: string, details?: string) {
    await apiService.reportUser(id, reason, details);
  }

  async fetchSuperConnects() {
    const { data } = await apiService.getSuperConnectsReceived();
    runInAction(() => {
      this.superConnectsReceived = data.super_connects ?? [];
      this.dailySuperConnectsSent = data.daily_sent ?? 0;
    });
  }

  async sendSuperConnect(receiverId: string, message?: string) {
    await apiService.sendSuperConnect(receiverId, message);
    runInAction(() => {
      this.dailySuperConnectsSent += 1;
    });
  }

  async setGhostMode(isDiscoverable: boolean) {
    await apiService.setGhostMode(isDiscoverable);
    runInAction(() => {
      // isGhostMode is true when user is NOT discoverable
      this.isGhostMode = !isDiscoverable;
    });
  }

  async setVibeTags(tags: string[]) {
    await apiService.setVibeTags(tags);
    runInAction(() => {
      this.vibeTags = tags;
    });
  }

  async setTravelMode(lat: number, lng: number, hours?: number) {
    await apiService.setTravelMode(lat, lng, hours);
    runInAction(() => {
      this.isTravelModeActive = true;
    });
  }

  async clearTravelMode() {
    await apiService.clearTravelMode();
    runInAction(() => {
      this.isTravelModeActive = false;
    });
  }
}

export const socialStore = new SocialStore();
