import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Note Schema — stores markdown notes for each user.
 */
export interface INote extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  wordCount: number;
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    tags: { type: [String], default: [] },
    pinned: { type: Boolean, default: false },
    wordCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>("Note", noteSchema);
export default Note;
