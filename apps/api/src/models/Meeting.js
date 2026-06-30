import mongoose from "mongoose";

const transcriptLineSchema = new mongoose.Schema(
  {
    speaker: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    spokenAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const actionItemSchema = new mongoose.Schema(
  {
    assignee: { type: String, required: true, trim: true },
    task: { type: String, required: true, trim: true },
    due: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "done"], default: "open" }
  },
  { _id: false }
);

const meetingSchema = new mongoose.Schema(
  {
    chamaId: { type: mongoose.Schema.Types.ObjectId, ref: "Chama" },
    title: { type: String, required: true, trim: true },
    scheduledFor: { type: Date, required: true },
    durationMinutes: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["scheduled", "live", "completed"], default: "completed" },
    attendees: [{ type: String, trim: true }],
    transcript: [transcriptLineSchema],
    summary: { type: String, required: true, trim: true },
    decisions: [{ type: String, trim: true }],
    actionItems: [actionItemSchema],
    nextMeeting: { type: String, trim: true },
    aiConfidence: { type: Number, min: 0, max: 100, default: 92 }
  },
  { timestamps: true }
);

meetingSchema.index({ scheduledFor: -1 });
meetingSchema.index({ chamaId: 1, scheduledFor: -1 });

export const Meeting = mongoose.model("Meeting", meetingSchema);
