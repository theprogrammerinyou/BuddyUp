import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";
import { authStorage } from "@/services/api";

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  other_user: {
    id: string;
    display_name: string;
    avatar?: { image_url: string; name: string; franchise: string };
    interests: string[];
  };
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

class ChatStore {
  matches: Match[] = [];
  messages: Record<string, Message[]> = {};
  isLoading = false;
  activeSocket: WebSocket | null = null;
  activeMatchId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchMatches() {
    try {
      const { data } = await api.get("/matches");
      runInAction(() => {
        this.matches = data.matches ?? [];
      });
    } catch (e) {
      console.error(e);
    }
  }

  async fetchHistory(matchId: string) {
    try {
      const { data } = await api.get(`/chats/${matchId}`);
      runInAction(() => {
        this.messages[matchId] = data.messages ?? [];
      });
    } catch (e) {
      console.error(e);
    }
  }

  connectWS(matchId: string) {
    if (this.activeMatchId === matchId && this.activeSocket?.readyState === WebSocket.OPEN) return;
    this.disconnectWS();

    const token = authStorage.getToken();
    const url = `ws://localhost:8080/ws/chat/${matchId}?token=${token}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      runInAction(() => {
        this.activeSocket = ws;
        this.activeMatchId = matchId;
      });
    };

    ws.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);
      runInAction(() => {
        if (!this.messages[matchId]) this.messages[matchId] = [];
        this.messages[matchId].push(msg);
      });
    };

    ws.onerror = (e) => console.error("WS error", e);
    ws.onclose = () => {
      runInAction(() => {
        this.activeSocket = null;
        this.activeMatchId = null;
      });
    };
  }

  sendMessage(content: string) {
    if (this.activeSocket?.readyState === WebSocket.OPEN) {
      this.activeSocket.send(JSON.stringify({ content }));
    }
  }

  disconnectWS() {
    this.activeSocket?.close();
    this.activeSocket = null;
    this.activeMatchId = null;
  }
}

export const chatStore = new ChatStore();
