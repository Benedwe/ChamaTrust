import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Landmark } from "lucide-react";
import { getSession } from "../lib/auth";
import { apiFetch } from "../lib/api";
import { getChamaTrustAddress } from "../lib/contracts";

export function CreateChamaModal({ isOpen, onClose, onSuccess, onLoginRequest }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    country: "TZ",
    currency: "TZS",
    minimumContribution: "10000",
    quorum: "3"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const session = getSession();
    if (!session || !session.token) {
      setError("Please log in to create a Chama");
      setLoading(false);
      return;
    }

    try {
      const treasuryAddress = await getChamaTrustAddress();
      if (!treasuryAddress) {
        throw new Error(
          "ChamaTrust contract is not deployed yet. Run npm run deploy:fuji and redeploy the site."
        );
      }

      const payload = {
        name: formData.name,
        country: formData.country,
        currency: formData.currency,
        minimumContribution: Number(formData.minimumContribution),
        quorum: Number(formData.quorum),
        treasuryAddress: treasuryAddress,
        phone: session.user.phone || "+255700000000" // Fallback if missing
      };

      const data = await apiFetch("/chamas", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSuccess(data.chama);
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
              <Landmark size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Create Chama</h2>
              <p className="text-sm font-semibold text-emerald-100/70">Launch your new community savings group</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-white">Chama Name</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-white placeholder-white/40 focus:border-mint focus:outline-none"
                placeholder="e.g. Umoja Network"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-white">Country</label>
                <select
                  className="w-full rounded-lg border border-white/20 bg-ink p-3 text-white focus:border-mint focus:outline-none"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                >
                  <option value="TZ">Tanzania</option>
                  <option value="KE">Kenya</option>
                  <option value="UG">Uganda</option>
                  <option value="RW">Rwanda</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-white">Currency</label>
                <select
                  className="w-full rounded-lg border border-white/20 bg-ink p-3 text-white focus:border-mint focus:outline-none"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="TZS">TZS</option>
                  <option value="KES">KES</option>
                  <option value="UGX">UGX</option>
                  <option value="RWF">RWF</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-white">Min Contribution</label>
                <input
                  type="number"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-white placeholder-white/40 focus:border-mint focus:outline-none"
                  value={formData.minimumContribution}
                  onChange={(e) => setFormData({ ...formData, minimumContribution: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-white">Vote Quorum</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-white placeholder-white/40 focus:border-mint focus:outline-none"
                  value={formData.quorum}
                  onChange={(e) => setFormData({ ...formData, quorum: e.target.value })}
                />
              </div>
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
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-4 text-base font-black text-ink shadow-lg hover:bg-mint/90 disabled:opacity-70"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Deploy Chama on Avalanche"}
            </button>
            <p className="mt-2 text-center text-xs text-emerald-100/50">
              This will create a new treasury smart contract.
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
