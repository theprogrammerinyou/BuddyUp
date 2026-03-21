// TypeScript interfaces matching the Go backend models

export interface Interest {
  id: number;
  name: string;
}

export interface User {
  id: number;
  createdAt: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  isOnline: boolean;
  points: number;
  interests: Interest[];
}

export interface Activity {
  id: number;
  createdAt: string;
  hostId: number;
  title: string;
  description: string;
  category: string;
  startTime: string;
  location: string;
  host: User;
  attendees: User[];
}

export interface Message {
  id: number;
  createdAt: string;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
}

export interface Conversation {
  id: number;
  createdAt: string;
  updatedAt: string;
  user1Id: number;
  user2Id: number;
  lastMessage: string;
  user1: User;
  user2: User;
}

export interface Notification {
  id: number;
  createdAt: string;
  userId: number;
  title: string;
  body: string;
  type: 'match' | 'message' | 'activity' | 'system';
  isRead: boolean;
}

export interface Event {
  id: number;
  organizerId: number;
  title: string;
  description: string;
  category: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  isVerified: boolean;
  organizer: User;
  attendees: User[];
}

export interface EventTicket {
  id: number;
  eventId: number;
  userId: number;
  ticketId: string;
  status: 'confirmed' | 'cancelled' | 'used';
  event: Event;
}

export interface FriendRequest {
  id: number;
  createdAt: string;
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'ignored';
  sender: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}
