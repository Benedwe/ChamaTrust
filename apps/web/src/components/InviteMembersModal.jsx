import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Users, CheckCircle2 } from "lucide-react";
import { getSession } from "../lib/auth";
import { apiFetch } from "../lib/api";

export function InviteMembersModal({ chamaId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    walletAddress: "",
    phone: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const session = getSession();
    if (!session || !session.token) {
      setError("Please log in to invite members");
      setLoading(false);
      return;
    }

    try {
      await apiFetch(`/chamas/${chamaId}/invite`, {
        method: "POST",
        body: JSON.stringify({
          walletAddress: formData.walletAddress,
          phone: formData.phone
        }),
      });

      setSuccessMsg(`Successfully invited member!`);
      setFormData({ walletAddress: "", phone: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!chamaId) return null;

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
              <h2 className="text-xl font-black text-white">Invite Members</h2>
              <p className="text-sm font-semibold text-emerald-100/70">Add someone to your new Chama</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-white">Wallet Address</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-white placeholder-white/40 focus:border-mint focus:outline-none"
                placeholder="0x..."
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-white">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-white placeholder-white/40 focus:border-mint focus:outline-none"
                placeholder="+254 7XX XXX XXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {error && <p className="text-sm font-bold text-rose-400">{error}</p>}
            
            {successMsg && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 size={18} />
                <p className="text-sm font-bold">{successMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-4 text-base font-black text-ink shadow-lg hover:bg-mint/90 disabled:opacity-70"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Send Invite"}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Skip for now
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
