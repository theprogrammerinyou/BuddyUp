import { makeAutoObservable, runInAction } from "mobx";
import { apiService } from "@/services/api";
import { Post, CreatePostData } from "@/types";

class PostStore {
  posts: Post[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchPosts(activityType?: string) {
    this.isLoading = true;
    try {
      const { data } = await apiService.listPosts({ activity_type: activityType });
      runInAction(() => {
        this.posts = data.posts ?? [];
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createPost(postData: CreatePostData): Promise<Post> {
    const { data } = await apiService.createPost(postData);
    runInAction(() => {
      this.posts.unshift(data.post);
    });
    return data.post;
  }

  async respondToPost(id: string, message: string) {
    const { data } = await apiService.respondToPost(id, message);
    return data.response;
  }

  async deletePost(id: string) {
    await apiService.deletePost(id);
    runInAction(() => {
      this.posts = this.posts.filter((p) => p.id !== id);
    });
  }
}

export const postStore = new PostStore();
