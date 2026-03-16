import { makeAutoObservable, runInAction } from "mobx";
import { apiService } from "@/services/api";
import { Group, CreateGroupData } from "@/types";

class GroupStore {
  groups: Group[] = [];
  myGroups: Group[] = [];
  selectedGroup: Group | null = null;
  selectedGroupMembers: any[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchGroups(activityType?: string) {
    this.isLoading = true;
    try {
      const { data } = await apiService.listGroups({ activity_type: activityType });
      runInAction(() => {
        this.groups = data.groups ?? [];
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchMyGroups() {
    this.isLoading = true;
    try {
      const { data } = await apiService.getMyGroups();
      runInAction(() => {
        this.myGroups = data.groups ?? [];
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createGroup(groupData: CreateGroupData): Promise<Group> {
    const { data } = await apiService.createGroup(groupData);
    runInAction(() => {
      this.myGroups.unshift(data.group);
    });
    return data.group;
  }

  async joinGroup(id: string) {
    await apiService.joinGroup(id);
    runInAction(() => {
      const group = this.groups.find((g) => g.id === id);
      if (group) {
        group.is_member = true;
        group.member_count = (group.member_count ?? 0) + 1;
      }
    });
  }

  async leaveGroup(id: string) {
    await apiService.leaveGroup(id);
    runInAction(() => {
      const group = this.groups.find((g) => g.id === id);
      if (group) {
        group.is_member = false;
        group.member_count = Math.max((group.member_count ?? 1) - 1, 0);
      }
      this.myGroups = this.myGroups.filter((g) => g.id !== id);
    });
  }

  async fetchGroupMembers(id: string) {
    const { data } = await apiService.getGroupMembers(id);
    runInAction(() => {
      this.selectedGroupMembers = data.members ?? [];
    });
    return data.members ?? [];
  }

  setSelectedGroup(group: Group | null) {
    this.selectedGroup = group;
  }
}

export const groupStore = new GroupStore();
