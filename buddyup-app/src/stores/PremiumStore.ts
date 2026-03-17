import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

class PremiumStore {
  subscription: any | null = null;
  isLoading = false;
  boost: any | null = null;
  superLikesAvailable: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get isPremium(): boolean {
    return !!(
      this.subscription &&
      this.subscription.plan !== "free" &&
      this.subscription.status === "active"
    );
  }

  async fetchSubscription() {
    this.isLoading = true;
    try {
      const { data } = await api.get("/me/subscription");
      runInAction(() => {
        this.subscription = data;
      });
    } catch {
      // ignore
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async verifySubscription(provider: string, receipt: string, plan: string) {
    const { data } = await api.post("/me/subscription/verify", { provider, receipt, plan });
    runInAction(() => {
      this.subscription = data.subscription ?? data;
    });
    return data;
  }

  async activateBoost() {
    const { data } = await api.post("/me/boost");
    runInAction(() => {
      this.boost = data;
    });
    return data;
  }

  async fetchBoostStatus() {
    try {
      const { data } = await api.get("/me/boost");
      runInAction(() => {
        this.boost = data;
      });
    } catch {
      // ignore
    }
  }

  async purchaseSuperLikePack(provider: string, transactionId: string, quantity: number) {
    const { data } = await api.post("/me/super-like-packs", {
      provider,
      transaction_id: transactionId,
      quantity,
    });
    runInAction(() => {
      this.superLikesAvailable += quantity;
    });
    return data;
  }
}

export const premiumStore = new PremiumStore();
