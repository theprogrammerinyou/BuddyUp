import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

class XPStore {
  totalXP: number = 0;
  level: number = 1;
  recentEvents: any[] = [];
  challenges: any[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchXP() {
    this.isLoading = true;
    try {
      const { data } = await api.get("/me/xp");
      runInAction(() => {
        this.totalXP = data.total_xp ?? 0;
        this.level = data.level ?? 1;
        this.recentEvents = data.recent_events ?? [];
      });
    } catch {
      // ignore network errors
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchChallenges() {
    this.isLoading = true;
    try {
      const { data } = await api.get("/challenges");
      runInAction(() => {
        this.challenges = Array.isArray(data) ? data : data.challenges ?? [];
      });
    } catch {
      // ignore
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async completeChallenge(id: string) {
    const { data } = await api.post(`/challenges/${id}/complete`);
    runInAction(() => {
      this.challenges = this.challenges.map((c) =>
        c.id === id ? { ...c, completed: true } : c
      );
      if (data.xp_awarded) {
        this.totalXP += data.xp_awarded;
      }
    });
    return data;
  }
}

export const xpStore = new XPStore();
