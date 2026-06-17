import {
  Area,
  AreaChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { heatmap, savingsGrowth, treasuryMix } from "../data/demoData";

const colors = ["#0f3f2e", "#22d3ee", "#ffb454", "#d946ef"];

export function SavingsChart() {
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <AreaChart data={savingsGrowth}>
          <defs>
            <linearGradient id="savings" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip formatter={(value) => `${Number(value).toLocaleString()} TZS`} />
          <Area type="monotone" dataKey="savings" stroke="#0f3f2e" strokeWidth={3} fill="url(#savings)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LoanPerformanceChart() {
  return (
    <div className="h-44">
      <ResponsiveContainer>
        <LineChart data={savingsGrowth}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip formatter={(value) => `${Number(value).toLocaleString()} TZS`} />
          <Line type="monotone" dataKey="loans" stroke="#d946ef" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TreasuryPie() {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-3">
      <div className="h-36">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={treasuryMix} dataKey="value" innerRadius={42} outerRadius={66} paddingAngle={4}>
              {treasuryMix.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {treasuryMix.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index] }} />
              {item.name}
            </span>
            <span className="font-bold text-ink">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContributionHeatmap() {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {heatmap.map((day) => (
        <div
          key={day.day}
          className="aspect-square rounded"
          style={{
            background: `rgba(74, 222, 128, ${0.16 + day.level * 0.15})`
          }}
          title={`Day ${day.day}`}
        />
      ))}
    </div>
  );
}
