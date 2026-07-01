import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff,
  Sparkles, Users, FileText, Download, RotateCcw,
  CheckCircle2, ClipboardList, Zap, Radio
} from "lucide-react";
import "../styles/premium.css";
import "../styles/meeting.css";

/* ─── Simulated remote participants ──────────────────────── */
const REMOTE_PEERS = [
  { id: 1, name: "Grace Wanjiku",   initials: "GW", color: "#3a7bd5", role: "Chairperson" },
  { id: 2, name: "Amina Hassan",    initials: "AH", color: "#8b5cf6", role: "Treasurer"   },
  { id: 3, name: "John Kamau",      initials: "JK", color: "#f59e0b", role: "Secretary"   },
];

/* ─── Demo transcript lines that trickle in ─────────────── */
const DEMO_TRANSCRIPT_LINES = [
  { speaker: "Grace Wanjiku",  text: "Let's call the meeting to order. Quorum is confirmed — five members present." },
  { speaker: "You",            text: "Thank you. First agenda item: treasury balance update from Amina." },
  { speaker: "Amina Hassan",   text: "Our treasury balance stands at KSh 320,000. Emergency reserve is at 9%." },
  { speaker: "John Kamau",     text: "I'd like to request a loan of KSh 50,000 for farm inputs — seeds and fertilizer." },
  { speaker: "Grace Wanjiku",  text: "John's repayment history is excellent. I recommend we vote to approve the loan." },
  { speaker: "You",            text: "All in favour of approving John's loan? Please indicate." },
  { speaker: "Amina Hassan",   text: "Agreed. We should also review the loan repayment schedule for next month." },
  { speaker: "John Kamau",     text: "I'll ensure the first repayment is made by the end of this month." },
  { speaker: "Grace Wanjiku",  text: "Next meeting: first Saturday of next month, 10 AM. Any other business?" },
  { speaker: "You",            text: "Let's adjourn. Thank you everyone for your participation today." },
];

/* ─── Utilities ──────────────────────────────────────────── */
function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  const start = useCallback(() => {
    ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }, []);
  const stop = useCallback(() => clearInterval(ref.current), []);
  const reset = useCallback(() => { clearInterval(ref.current); setSeconds(0); }, []);
  const display = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return { display, start, stop, reset };
}

/* ─── Main component ─────────────────────────────────────── */
export function MeetingSummarizer() {
  // Phase: "lobby" | "room" | "minutes"
  const [phase, setPhase]     = useState("lobby");
  const [meetingName, setMeetingName] = useState("Monthly Chama Meeting");

  // Media state
  const [stream, setStream]   = useState(null);
  const [micOn, setMicOn]     = useState(true);
  const [camOn, setCamOn]     = useState(true);
  const localVideoRef          = useRef(null);

  // Transcript
  const [transcript, setTranscript] = useState([]);
  const transcriptRef               = useRef(null);
  const [isListening, setIsListening]   = useState(false);
  const recognitionRef                   = useRef(null);

  // Demo transcript ticker
  const demoTickerRef = useRef(null);
  const demoIndexRef  = useRef(0);

  // AI summary
  const [summary, setSummary]      = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const summaryIntervalRef          = useRef(null);

  // Simulated speaking peer
  const [speakingPeer, setSpeakingPeer] = useState(null);

  // Timer
  const timer = useTimer();

  /* ── Attach local video stream ── */
  // Runs whenever stream is acquired OR camOn flips back to true,
  // because toggling camera off/on unmounts & remounts the <video> element,
  // so we must re-assign srcObject each time it mounts.
  useEffect(() => {
    if (stream && camOn && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream, camOn]);

  /* ── Auto-scroll transcript ── */
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  /* ── Start meeting ── */
  const startMeeting = useCallback(async () => {
    // Get camera + mic
    let mediaStream = null;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      // Camera unavailable — demo mode without video
    }
    setStream(mediaStream);
    setPhase("room");
    timer.start();

    // Start live speech recognition (Web Speech API)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous     = true;
      recog.interimResults = false;
      recog.lang           = "en-GB";
      recog.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript.trim();
        if (text) {
          setTranscript(prev => [...prev, { speaker: "You", text }]);
        }
      };
      recog.onerror = () => {};
      recog.start();
      recognitionRef.current = recog;
      setIsListening(true);
    }

    // Demo transcript ticker — simulates remote members speaking
    demoTickerRef.current = setInterval(() => {
      const line = DEMO_TRANSCRIPT_LINES[demoIndexRef.current % DEMO_TRANSCRIPT_LINES.length];
      if (line.speaker !== "You") {
        setTranscript(prev => [...prev, line]);
        // Highlight the speaking peer tile
        const peer = REMOTE_PEERS.find(p => p.name === line.speaker);
        if (peer) {
          setSpeakingPeer(peer.id);
          setTimeout(() => setSpeakingPeer(null), 3500);
        }
      }
      demoIndexRef.current += 1;
    }, 7000);

    // Auto-summarize every 30 seconds
    summaryIntervalRef.current = setInterval(() => fetchSummary(), 30_000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fetch AI summary ── */
  const fetchSummary = useCallback(() => {
    setSummaryLoading(true);
    const text = transcript.map(l => `${l.speaker}: ${l.text}`).join("\n");

    apiFetch("/ai/summarize", {
      method: "POST",
      body: JSON.stringify({ transcript: text }),
    })
      .then(r => r.json())
      .then(data => { setSummary(data); setSummaryLoading(false); })
      .catch(() => {
        setSummary({
          summary: "Chama Meeting Summary\n\nThe meeting covered treasury health, active loans, and upcoming contributions. 3 key decisions were recorded.",
          decisions: [
            "Loan application reviewed and approved pending quorum.",
            "Treasury balance reviewed; emergency reserve maintained above 8%.",
            "Unanimous agreement on contribution increase of 10% from next cycle.",
          ],
          actionItems: [
            { assignee: "Treasurer",    task: "Share updated balance sheet", due: "48 hours" },
            { assignee: "Chairperson",  task: "Follow up on loan repayments", due: "End of week" },
            { assignee: "Secretary",    task: "Circulate official minutes", due: "24 hours" },
          ],
          attendees: ["Grace Wanjiku", "Benjamin Otieno", "Amina Hassan", "John Kamau", "Mary Njeri"],
          nextMeeting: "First Saturday of next month, 10:00 AM",
        });
        setSummaryLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  /* ── End meeting ── */
  const endMeeting = useCallback(() => {
    // Stop all media
    stream?.getTracks().forEach(t => t.stop());
    recognitionRef.current?.stop();
    clearInterval(demoTickerRef.current);
    clearInterval(summaryIntervalRef.current);
    timer.stop();

    // Fetch final summary
    fetchSummary();
    setPhase("minutes");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, fetchSummary]);

  /* ── Toggle mic ── */
  const toggleMic = useCallback(() => {
    const nextMicOn = !micOn;
    stream?.getAudioTracks().forEach(t => { t.enabled = nextMicOn; });

    if (!nextMicOn) {
      // Muting — stop recognition cleanly
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setIsListening(false);
    } else {
      // Unmuting — create a fresh recognition instance (calling .start() on
      // a stopped instance throws InvalidStateError in most browsers)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous     = true;
        recog.interimResults = false;
        recog.lang           = "en-GB";
        recog.onresult = (event) => {
          const text = event.results[event.results.length - 1][0].transcript.trim();
          if (text) setTranscript(prev => [...prev, { speaker: "You", text }]);
        };
        recog.onerror = () => {};
        try {
          recog.start();
          recognitionRef.current = recog;
          setIsListening(true);
        } catch {}
      }
    }
    setMicOn(nextMicOn);
  }, [stream, micOn]);

  /* ── Toggle cam ── */
  const toggleCam = useCallback(() => {
    const nextCamOn = !camOn;
    stream?.getVideoTracks().forEach(t => { t.enabled = nextCamOn; });
    setCamOn(nextCamOn);
    // After setCamOn(true) the <video> element remounts; the useEffect
    // [stream, camOn] will fire and re-assign srcObject automatically.
  }, [stream, camOn]);

  /* ── Download minutes ── */
  const downloadMinutes = useCallback(() => {
    if (!summary) return;
    const lines = [
      `CHAMA MEETING MINUTES`,
      `Meeting: ${meetingName}`,
      `Date: ${new Date().toLocaleDateString("en-KE", { dateStyle: "full" })}`,
      `Duration: ${timer.display}`,
      ``,
      `ATTENDEES`,
      ...(summary.attendees || []).map(a => `  • ${a}`),
      ``,
      `SUMMARY`,
      summary.summary,
      ``,
      `DECISIONS`,
      ...(summary.decisions || []).map(d => `  › ${d}`),
      ``,
      `ACTION ITEMS`,
      ...(summary.actionItems || []).map(a => `  [${a.assignee}] ${a.task} — Due: ${a.due}`),
      ``,
      `NEXT MEETING`,
      `  ${summary.nextMeeting}`,
      ``,
      `FULL TRANSCRIPT`,
      ...transcript.map(l => `  ${l.speaker}: ${l.text}`),
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `ChamaTrust_Minutes_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [summary, transcript, meetingName, timer.display]);

  /* ── New meeting ── */
  const resetAll = useCallback(() => {
    setPhase("lobby");
    setStream(null);
    setMicOn(true);
    setCamOn(true);
    setTranscript([]);
    setSummary(null);
    setSummaryLoading(false);
    setIsListening(false);
    setSpeakingPeer(null);
    demoIndexRef.current = 0;
    timer.reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══════════════════════════════════════════════════════
     RENDER — LOBBY
  ═══════════════════════════════════════════════════════ */
  if (phase === "lobby") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="meeting-lobby">
          <motion.div
            className="meeting-lobby-logo"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <Video size={36} color="#fff" />
          </motion.div>

          <h2 className="meeting-lobby-title">Chama Video Meeting</h2>
          <p className="meeting-lobby-subtitle">
            Start a live video conference for your chama. Our AI will transcribe speech and
            generate structured minutes in real time — no extra apps needed.
          </p>

          <input
            id="meeting-name-input"
            className="meeting-lobby-input"
            value={meetingName}
            onChange={e => setMeetingName(e.target.value)}
            placeholder="Meeting name…"
          />

          <button
            id="start-meeting-btn"
            className="meeting-start-btn"
            onClick={startMeeting}
          >
            <Video size={20} />
            Start Meeting
          </button>

          <div className="meeting-lobby-info">
            {[
              { icon: <Users size={14} />, label: "5 members invited" },
              { icon: <Mic size={14} />,   label: "Live AI transcription" },
              { icon: <Sparkles size={14} />, label: "Auto-generated minutes" },
            ].map(({ icon, label }) => (
              <div key={label} className="lobby-info-chip">
                {icon} {label}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     RENDER — POST-MEETING MINUTES
  ═══════════════════════════════════════════════════════ */
  if (phase === "minutes") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="minutes-view">
        <div className="minutes-header">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{ display: "inline-block", marginBottom: "16px" }}
          >
            <CheckCircle2 size={52} color="#00d2ff" />
          </motion.div>
          <h2 className="minutes-title">Meeting Complete</h2>
          <p className="minutes-meta">
            {meetingName} · {new Date().toLocaleDateString("en-KE", { dateStyle: "full" })} · {timer.display}
          </p>
        </div>

        {summaryLoading && (
          <div className="minutes-card" style={{ textAlign: "center", padding: "40px" }}>
            <div className="ai-dot-pulse" style={{ justifyContent: "center", marginBottom: "12px" }}>
              <span /><span /><span />
            </div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>
              AI is generating your meeting minutes…
            </p>
          </div>
        )}

        {summary && !summaryLoading && (
          <AnimatePresence>
            {/* Attendees */}
            <motion.div key="att" className="minutes-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <p className="minutes-card-title"><Users size={14} /> Attendees ({summary.attendees?.length || 0})</p>
              <div className="attendee-chips">
                {(summary.attendees || []).map(a => <span key={a} className="attendee-chip">{a}</span>)}
              </div>
            </motion.div>

            {/* Summary */}
            <motion.div key="sum" className="minutes-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <p className="minutes-card-title"><FileText size={14} /> Summary</p>
              {summary.summary.split("\n").map((l, i) => (
                <p key={i} className="summary-text" style={{ marginBottom: "4px" }}>{l}</p>
              ))}
            </motion.div>

            {/* Decisions */}
            <motion.div key="dec" className="minutes-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
              <p className="minutes-card-title"><CheckCircle2 size={14} /> Decisions ({summary.decisions?.length || 0})</p>
              <ul className="summary-list">
                {(summary.decisions || []).map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </motion.div>

            {/* Action Items */}
            <motion.div key="act" className="minutes-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
              <p className="minutes-card-title"><ClipboardList size={14} /> Action Items</p>
              {(summary.actionItems || []).map((item, i) => (
                <div key={i} className="action-item">
                  <span className="action-assignee">{item.assignee}</span>
                  {" — "}{item.task}
                  <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: "6px", fontSize: "0.75rem" }}>
                    Due: {item.due}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Next meeting */}
            {summary.nextMeeting && (
              <motion.div key="next" className="minutes-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                <p className="minutes-card-title"><Radio size={14} /> Next Meeting</p>
                <p className="summary-text">{summary.nextMeeting}</p>
              </motion.div>
            )}

            {/* Transcript */}
            {transcript.length > 0 && (
              <motion.div key="trans" className="minutes-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.40 }}>
                <p className="minutes-card-title"><Mic size={14} /> Transcript ({transcript.length} lines)</p>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {transcript.map((l, i) => (
                    <p key={i} className="transcript-line">
                      <span className="speaker">{l.speaker}:</span>{l.text}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <button id="download-minutes-btn" className="minutes-download-btn" onClick={downloadMinutes}>
          <Download size={18} /> Download Minutes (.txt)
        </button>
        <button className="new-meeting-btn" onClick={resetAll}>
          <RotateCcw size={15} style={{ marginRight: "6px" }} />
          Start New Meeting
        </button>
      </motion.div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     RENDER — LIVE ROOM
  ═══════════════════════════════════════════════════════ */
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="meeting-room">
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="live-badge">● LIVE</span>
          <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "rgba(255,255,255,0.8)" }}>
            {meetingName}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="meeting-timer">{timer.display}</span>
          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
            <Users size={13} style={{ display: "inline", marginRight: "4px" }} />
            {REMOTE_PEERS.length + 1} participants
          </span>
        </div>
      </div>

      <div className="meeting-room-body">
        {/* ── Left: Video Grid ── */}
        <div>
          <div className="video-grid">
            {/* Local tile */}
            <div id="local-video-tile" className={`video-tile local ${micOn ? "speaking" : ""}`}>
              {stream && camOn ? (
                <video ref={localVideoRef} autoPlay muted playsInline />
              ) : (
                <div className="video-tile-avatar">
                  <div className="avatar-circle" style={{ background: "linear-gradient(135deg, #3a7bd5, #00d2ff)" }}>
                    You
                  </div>
                </div>
              )}
              <div className="video-tile-overlay">
                <span className="video-tile-name">
                  {!micOn && <MicOff size={12} className="muted-icon" />}
                  You (Host)
                </span>
                {isListening && micOn && <div className="speaking-dot" />}
              </div>
            </div>

            {/* Remote peer tiles */}
            {REMOTE_PEERS.map(peer => (
              <div
                key={peer.id}
                id={`peer-tile-${peer.id}`}
                className={`video-tile ${speakingPeer === peer.id ? "speaking" : ""}`}
              >
                <div className="video-tile-avatar">
                  <div className="avatar-circle" style={{ background: peer.color }}>
                    {peer.initials}
                  </div>
                </div>
                <div className="video-tile-overlay">
                  <span className="video-tile-name">{peer.name}</span>
                  {speakingPeer === peer.id && <div className="speaking-dot" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Side Panel ── */}
        <div className="meeting-side-panel">
          {/* Live Transcript */}
          <div className="transcript-panel">
            <div className="panel-header">
              <span className="panel-title">
                <Mic size={12} /> Transcript
              </span>
              {isListening && <span className="live-badge">LIVE</span>}
            </div>
            <div className="transcript-body" ref={transcriptRef}>
              {transcript.length === 0 ? (
                <p className="transcript-empty">
                  Speak to see live transcription…
                  {!window.SpeechRecognition && !window.webkitSpeechRecognition && (
                    <><br /><span style={{ fontSize: "0.75rem" }}>Demo text will appear shortly.</span></>
                  )}
                </p>
              ) : (
                transcript.map((line, i) => (
                  <div key={i} className="transcript-line">
                    <span className="speaker">{line.speaker}:</span>
                    {line.text}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Summary */}
          <div className="ai-summary-panel">
            <div className="panel-header">
              <span className="panel-title">
                <Sparkles size={12} /> AI Summary
              </span>
              <button
                id="summarize-now-btn"
                onClick={fetchSummary}
                disabled={summaryLoading}
                style={{
                  background: "rgba(0,210,255,0.15)",
                  border: "1px solid rgba(0,210,255,0.3)",
                  borderRadius: "8px",
                  color: "#00d2ff",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  padding: "4px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  opacity: summaryLoading ? 0.5 : 1,
                }}
              >
                <Zap size={11} /> Now
              </button>
            </div>

            {summaryLoading && (
              <div className="ai-summary-loading">
                <div className="ai-dot-pulse">
                  <span /><span /><span />
                </div>
                AI is summarising…
              </div>
            )}

            {!summaryLoading && !summary && (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", lineHeight: "1.6" }}>
                Summary updates every 30 s. Click <strong>Now</strong> to generate immediately.
              </p>
            )}

            {!summaryLoading && summary && (
              <AnimatePresence mode="wait">
                <motion.div key={summary.summary} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {summary.decisions?.length > 0 && (
                    <div className="summary-section">
                      <p className="summary-section-title">Decisions</p>
                      <ul className="summary-list">
                        {summary.decisions.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    </div>
                  )}
                  {summary.actionItems?.length > 0 && (
                    <div className="summary-section">
                      <p className="summary-section-title">Action Items</p>
                      {summary.actionItems.map((a, i) => (
                        <div key={i} className="action-item">
                          <span className="action-assignee">{a.assignee}:</span>{" "}{a.task}
                        </div>
                      ))}
                    </div>
                  )}
                  {summary.nextMeeting && (
                    <div className="summary-section">
                      <p className="summary-section-title">Next Meeting</p>
                      <p className="summary-text">{summary.nextMeeting}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="meeting-toolbar">
        <button
          id="toggle-mic-btn"
          className={`toolbar-btn ${micOn ? "active" : "off"}`}
          onClick={toggleMic}
          title={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? <Mic size={22} /> : <MicOff size={22} />}
          <span className="toolbar-label">{micOn ? "Mute" : "Unmuted"}</span>
        </button>

        <button
          id="toggle-cam-btn"
          className={`toolbar-btn ${camOn ? "active" : "off"}`}
          onClick={toggleCam}
          title={camOn ? "Stop camera" : "Start camera"}
        >
          {camOn ? <Video size={22} /> : <VideoOff size={22} />}
          <span className="toolbar-label">{camOn ? "Camera" : "No cam"}</span>
        </button>

        <button
          className="toolbar-btn"
          title="Share screen (demo)"
          onClick={() => alert("Screen share would be enabled in a full deployment.")}
        >
          <MonitorUp size={22} />
          <span className="toolbar-label">Share</span>
        </button>

        <div className="toolbar-separator" />

        <button
          id="summarize-toolbar-btn"
          className="toolbar-btn active"
          onClick={fetchSummary}
          disabled={summaryLoading}
          title="Get AI summary now"
        >
          <Sparkles size={22} />
          <span className="toolbar-label">AI Sum.</span>
        </button>

        <div className="toolbar-separator" />

        <button
          id="end-meeting-btn"
          className="toolbar-btn danger"
          onClick={endMeeting}
          title="End meeting"
        >
          <PhoneOff size={22} />
          <span className="toolbar-label">End</span>
        </button>
      </div>
    </motion.div>
  );
}
