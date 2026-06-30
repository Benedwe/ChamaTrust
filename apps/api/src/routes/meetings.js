import express from "express";
import { z } from "zod";
import { Meeting } from "../models/Meeting.js";

const router = express.Router();

const transcriptLineSchema = z.object({
  speaker: z.string().trim().min(1).max(80),
  text: z.string().trim().min(1).max(800)
});

const actionItemSchema = z.object({
  assignee: z.string().trim().min(1).max(80),
  task: z.string().trim().min(1).max(240),
  due: z.string().trim().min(1).max(80),
  status: z.enum(["open", "done"]).default("open")
});

const createMeetingSchema = z.object({
  title: z.string().trim().min(3).max(120),
  scheduledFor: z.coerce.date().default(() => new Date()),
  durationMinutes: z.number().int().min(0).max(1440).default(0),
  attendees: z.array(z.string().trim().min(1).max(80)).max(100).default([]),
  transcript: z.array(transcriptLineSchema).max(500).default([]),
  summary: z.string().trim().min(10).max(4000),
  decisions: z.array(z.string().trim().min(1).max(300)).max(50).default([]),
  actionItems: z.array(actionItemSchema).max(50).default([]),
  nextMeeting: z.string().trim().max(160).optional(),
  aiConfidence: z.number().min(0).max(100).default(92)
});

function serializeMeeting(meeting) {
  return {
    id: meeting._id.toString(),
    title: meeting.title,
    scheduledFor: meeting.scheduledFor,
    durationMinutes: meeting.durationMinutes,
    status: meeting.status,
    attendees: meeting.attendees,
    transcript: meeting.transcript,
    summary: meeting.summary,
    decisions: meeting.decisions,
    actionItems: meeting.actionItems,
    nextMeeting: meeting.nextMeeting,
    aiConfidence: meeting.aiConfidence,
    source: "mongodb"
  };
}

router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const meetings = await Meeting.find().sort({ scheduledFor: -1 }).limit(limit);
  res.json({ meetings: meetings.map(serializeMeeting), source: "mongodb" });
});

router.get("/latest", async (req, res) => {
  const meeting = await Meeting.findOne().sort({ scheduledFor: -1 });
  if (!meeting) {
    return res.status(404).json({ error: "No meetings found" });
  }

  return res.json({ meeting: serializeMeeting(meeting), source: "mongodb" });
});

router.post("/", async (req, res) => {
  const input = createMeetingSchema.parse(req.body);
  const meeting = await Meeting.create({ ...input, status: "completed" });
  res.status(201).json({ meeting: serializeMeeting(meeting), source: "mongodb" });
});

export default router;
