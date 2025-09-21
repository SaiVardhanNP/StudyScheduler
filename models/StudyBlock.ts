import mongoose from "mongoose";

const StudyBlockSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const StudyBlock = mongoose.model("StudyBlock", StudyBlockSchema);
