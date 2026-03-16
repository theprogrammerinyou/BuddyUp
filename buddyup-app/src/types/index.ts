// Phase 2 TypeScript interfaces and constants

export const ACTIVITY_TYPES = [
  "gym",
  "coding",
  "hiking",
  "gaming",
  "sports",
  "music",
  "travel",
  "food",
  "arts",
  "fitness",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const VIBE_TAGS = [
  "early bird",
  "night owl",
  "introvert",
  "extrovert",
  "foodie",
  "bookworm",
  "adventurer",
  "homebody",
  "creative",
  "analytical",
  "spontaneous",
  "planner",
  "chill",
  "ambitious",
  "spiritual",
] as const;

export type VibeTag = (typeof VIBE_TAGS)[number];

export interface Group {
  id: string;
  name: string;
  description: string;
  activity_type: string;
  creator_id: string;
  cover_image_url?: string;
  max_members: number;
  is_public: boolean;
  member_count?: number;
  is_member?: boolean;
  created_at: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  activity_type: string;
  cover_image_url?: string;
  max_members?: number;
  is_public?: boolean;
}

export interface Post {
  id: string;
  author_id: string;
  author?: {
    id: string;
    display_name: string;
    bio?: string;
    avatar_character_id?: number;
    interests?: string[];
  };
  content: string;
  activity_type?: string;
  latitude?: number;
  longitude?: number;
  event_time?: string;
  is_active: boolean;
  expires_at?: string;
  response_count?: number;
  created_at: string;
}

export interface PostResponse {
  id: string;
  post_id: string;
  responder_id: string;
  responder?: {
    id: string;
    display_name: string;
  };
  message: string;
  created_at: string;
}

export interface CreatePostData {
  content: string;
  activity_type?: string;
  latitude?: number;
  longitude?: number;
  event_time?: string;
  expires_hours?: number;
}

export interface Event {
  id: string;
  organizer_id: string;
  organizer?: {
    id: string;
    display_name: string;
    bio?: string;
  };
  title: string;
  description?: string;
  activity_type: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  starts_at: string;
  ends_at?: string;
  max_attendees?: number;
  cover_image_url?: string;
  is_public: boolean;
  rsvp_count?: number;
  user_rsvp?: string;
  created_at: string;
}

export interface EventRSVP {
  event_id: string;
  user_id: string;
  user?: {
    id: string;
    display_name: string;
  };
  status: string;
  rsvped_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  activity_type: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  starts_at: string;
  ends_at?: string;
  max_attendees?: number;
  cover_image_url?: string;
  is_public?: boolean;
}

export interface SuperConnect {
  id: string;
  sender_id: string;
  sender?: {
    id: string;
    display_name: string;
    bio?: string;
    avatar?: { image_url?: string; name?: string };
  };
  receiver_id: string;
  message?: string;
  seen: boolean;
  created_at: string;
}

export interface BlockedUser {
  id: string;
  display_name: string;
  bio?: string;
  avatar_character_id?: number;
  interests?: string[];
  created_at: string;
}
