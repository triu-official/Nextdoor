export interface Post {
  $id?: string;
  content: string;
  userId: string;
  authorName: string;
  $createdAt?: string;
}

export interface Comment {
  $id?: string;
  content: string;
  postId: string;
  userId: string;
  authorName: string;
  $createdAt?: string;
}

export interface Business {
  $id?: string;
  name: string;
  category: string;
  shortDescription: string;
}

export interface Circle {
  $id?: string;
  name: string;
  description: string;
}

export interface Channel {
  $id?: string;
  name: string;
  circleId: string;
}

export interface Message {
  $id?: string;
  content: string;
  channelId: string;
  userId: string;
  authorName: string;
  $createdAt?: string;
}
