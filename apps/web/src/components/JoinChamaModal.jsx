import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Users } from "lucide-react";
import { getSession } from "../lib/auth";
import { apiFetch } from "../lib/api";

export function JoinChamaModal({ isOpen, onClose, onSuccess, onLoginRequest }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [chamas, setChamas] = useState([]);
  const [selectedChamaId, setSelectedChamaId] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadChamas();
    }
  }, [isOpen]);

  const loadChamas = async () => {
    setFetching(true);
    setError("");
    try {
      const data = await apiFetch("/chamas");
      if (data?.chamas) {
        setChamas(data.chamas);
        if (data.chamas.length > 0) {
          setSelectedChamaId(data.chamas[0]._id);
        }
      }
    } catch (err) {
      setError("Failed to load Chamas: " + err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChamaId) {
      setError("Please select a Chama to join");
      return;
    }
    if (!phone || phone.length < 8) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");

    const session = getSession();
    if (!session || !session.token) {
      setError("Please log in to join a Chama");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch(`/chamas/${selectedChamaId}/join`, {
        method: "POST",
        body: JSON.stringify({ phone }),
      });

      if (data?.chama) {
        onSuccess(data.chama);
      } else {
        throw new Error("Failed to join Chama");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-ink p-6 shadow-2xl"
          style={{ background: "var(--glass-bg)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-ink">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Join Chama</h2>
              <p className="text-sm font-semibold text-emerald-100/70">Connect with an existing community group</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-white">Select Chama</label>
              {fetching ? (
                <div className="flex items-center gap-2 p-3 text-sm text-slate-400">
                  <Loader2 size={16} className="animate-spin" /> Loading available Chamas...
                </div>
              ) : chamas.length === 0 ? (
                <div className="p-3 text-sm text-slate-400 border border-white/10 rounded-lg bg-white/5">
                  No Chamas found. Create one first!
                </div>
              ) : (
                <select
                  required
                  className="w-full rounded-lg border border-white/20 bg-ink p-3 text-white focus:border-mint focus:outline-none"
                  value={selectedChamaId}
                  onChange={(e) => setSelectedChamaId(e.target.value)}
                >
                  {chamas.map((chama) => (
                    <option key={chama._id} value={chama._id}>
                      {chama.name} ({chama.members?.length || 0} members)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-white">Your Phone Number (Mobile Money)</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-white placeholder-white/40 focus:border-mint focus:outline-none"
                placeholder="e.g. +255711222333"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex flex-col gap-2 rounded-lg bg-rose-500/10 p-3 border border-rose-500/20">
                <p className="text-sm font-bold text-rose-400">{error}</p>
                {error.includes("log in") && onLoginRequest && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLoginRequest();
                    }}
                    className="mt-1 w-full rounded-lg bg-rose-500/20 py-2 text-sm font-bold text-rose-300 hover:bg-rose-500/30"
                  >
                    Go to Login Screen
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || chamas.length === 0}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-4 text-base font-black text-ink shadow-lg hover:bg-mint/90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Join Selected Chama"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
