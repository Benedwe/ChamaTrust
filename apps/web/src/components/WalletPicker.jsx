import { motion } from "framer-motion";
import { WalletCards, X } from "lucide-react";

export function WalletPicker({ wallets, onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink p-5 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletCards size={20} className="text-mint" />
            <h2 className="text-lg font-bold">Connect Wallet</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-sm text-white/60">
          Choose a Web3 wallet. You will be switched to Avalanche Fuji testnet.
        </p>
        <div className="flex flex-col gap-2">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              type="button"
              onClick={() => onSelect(wallet.id)}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold transition hover:border-mint/40 hover:bg-white/10"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-mint/15 text-mint">
                <WalletCards size={18} />
              </span>
              {wallet.name}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
