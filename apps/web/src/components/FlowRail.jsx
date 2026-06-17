import { motion } from "framer-motion";
import { Landmark, Smartphone, WalletCards } from "lucide-react";

const flowIcons = {
  mobile: Smartphone,
  wallet: WalletCards,
  treasury: Landmark
};

export function FlowRail({ direction = "deposit", provider = "M-Pesa" }) {
  const steps = direction === "deposit"
    ? [
        { label: provider, icon: "mobile" },
        { label: "Secure wallet", icon: "wallet" },
        { label: "Chama treasury", icon: "treasury" }
      ]
    : [
        { label: "Chama treasury", icon: "treasury" },
        { label: "Secure wallet", icon: "wallet" },
        { label: provider, icon: "mobile" }
      ];

  return (
    <div className="relative mt-4 rounded-lg bg-white/70 p-3">
      <div className="absolute left-8 right-8 top-8 h-1 rounded-full bg-emerald-100" />
      <motion.div
        className="absolute left-8 top-8 h-1 rounded-full bg-mint"
        initial={{ width: 0 }}
        animate={{ width: "calc(100% - 4rem)" }}
        transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse" }}
      />
      <div className="relative grid grid-cols-3 gap-2">
        {steps.map((step) => {
          const Icon = flowIcons[step.icon];
          return (
            <div key={step.label} className="text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-ink text-white shadow-lg">
                <Icon size={18} />
              </div>
              <p className="mt-2 text-xs font-bold text-ink">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
