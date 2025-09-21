import mongoose from "mongoose";

const StudyBlockSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    subject: {
      type: String,
      required: true,
      enum: [
        "Mathematics",
        "Physics",
        "Computer Science",
        "Literature",
        "Chemistry",
        "Biology",
        "History",
        "Other",
      ],
      default: "Other",
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    reminderSent: { type: Boolean, default: false, index: true },
  },
  { timestamps: true } 
);

StudyBlockSchema.index({ userId: 1, startTime: 1 });
StudyBlockSchema.index({ startTime: 1, reminderSent: 1 });
StudyBlockSchema.index({ userId: 1, createdAt: -1 });

StudyBlockSchema.pre("save", function (next) {
  if (this.endTime <= this.startTime) {
    return next(new Error("End time must be after start time"));
  }

  if (this.isNew && this.startTime < new Date()) {
    return next(new Error("Start time must be in the future"));
  }

  const duration =
    ((this as any).endTime - (this as any).startTime) / (1000 * 60);
  if (duration < 15) {
    return next(new Error("Study block must be at least 15 minutes long"));
  }
  if (duration > 480) {
    return next(new Error("Study block cannot exceed 8 hours"));
  }

  next();
});

StudyBlockSchema.methods.isActive = function () {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
};

StudyBlockSchema.methods.isUpcoming = function () {
  return new Date() < this.startTime;
};

StudyBlockSchema.methods.getDurationMinutes = function () {
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
};

StudyBlockSchema.statics.findOverlapping = function (
  userId,
  startTime,
  endTime,
  excludeId = null
) {
  startTime = new Date(startTime);
  endTime = new Date(endTime);

  const query: any = {
    userId,
    $or: [
      { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
      { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
    ],
  };

  if (excludeId) query._id = { $ne: excludeId };

  return this.findOne(query);
};

export const StudyBlock =
  mongoose.models.StudyBlock || mongoose.model("StudyBlock", StudyBlockSchema);
