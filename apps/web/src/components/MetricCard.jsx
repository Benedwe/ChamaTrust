import { motion } from "framer-motion";

export function MetricCard({ icon: Icon, label, value, detail, tone = "bg-canopy text-white" }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass rounded-lg p-4"
    >
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}>
          <Icon size={19} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600">{detail}</p>
    </motion.div>
  );
}
