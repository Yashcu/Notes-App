import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema({
    userId: {type: String, required: true, index: true},
    title: {type: String, required: true},
    content: {type: String, default: ''},
    tags: {type: [String], default: []},
    pinned: { type: Boolean , default: false},
});

export default mongoose.model('Note', noteSchema);
