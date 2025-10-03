/**
 * Shared types for user and note entities used throughout the app.
 */

/**
 * Represents an authenticated user.
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Represents a single markdown note.
 */
export interface Note {
  _id: string;          // MongoDB note ID
  userId: string;       // ID of the user who owns the note
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  wordCount?: number;   // Optional: calculated on backend
  createdAt: string;    // ISO date string
  updatedAt: string;    // ISO date string
}
