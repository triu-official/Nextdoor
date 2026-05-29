export interface User {
  id: string;
  email: string;
  passwordHash: string; // salted hash
  salt: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// More types can be added as needed.
