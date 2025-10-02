export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Note {
  _id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}
