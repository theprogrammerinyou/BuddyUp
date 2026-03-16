import { makeAutoObservable, runInAction } from "mobx";
import { apiService } from "@/services/api";
import { Event, CreateEventData } from "@/types";

class EventStore {
  events: Event[] = [];
  myEvents: Event[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchEvents(activityType?: string) {
    this.isLoading = true;
    try {
      const { data } = await apiService.listEvents({ activity_type: activityType });
      runInAction(() => {
        this.events = data.events ?? [];
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    const { data } = await apiService.createEvent(eventData);
    runInAction(() => {
      this.events.unshift(data.event);
    });
    return data.event;
  }

  async rsvpEvent(id: string, status: string) {
    await apiService.rsvpEvent(id, status);
    runInAction(() => {
      const event = this.events.find((e) => e.id === id);
      if (event) {
        event.user_rsvp = status;
        if (status === "going") {
          event.rsvp_count = (event.rsvp_count ?? 0) + 1;
        }
      }
    });
  }

  async fetchMyEvents() {
    this.isLoading = true;
    try {
      const { data } = await apiService.getMyEvents();
      runInAction(() => {
        this.myEvents = data.events ?? [];
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

export const eventStore = new EventStore();
