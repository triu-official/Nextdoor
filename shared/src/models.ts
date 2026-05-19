export interface User {
  id: string;
  name: string;
  phone: string;
  city: string;
  locality: string;
  pincode?: string;
  lat: number;
  lng: number;
  isVerified: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  pollOptions?: string[];
  tags?: string[];
  city: string;
  locality: string;
  lat: number;
  lng: number;
  createdAt: string;
  upvotes: number;
  commentsCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Business {
  id: string;
  ownerUserId?: string;
  name: string;
  category: string;
  shortDescription: string;
  city: string;
  locality: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  whatsapp?: string;
  imageUrl?: string;
  avgRating: number;
  createdAt: string;
}

export interface Society {
  id: string;
  name: string;
  city: string;
  locality: string;
  accessCode: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface CircleChannel {
  id: string;
  societyId: string;
  name: string;
  createdAt: string;
}

export interface CircleMessage {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface LocalitySeed {
  city: string;
  locality: string;
  pincode?: string;
  lat: number;
  lng: number;
}
