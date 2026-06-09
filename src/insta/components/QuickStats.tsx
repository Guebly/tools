
import { motion } from "framer-motion";
import { Target, DollarSign, Flame, BarChart3 } from "lucide-react";

interface Props {
  harmonyScore: number;
  feedCount: number;
}

export default function QuickStats({ harmonyScore, feedCount }: Props) {
  // Calculate potential scores
  const reachPotential = harmonyScore > 70 ? "Alto" : harmonyScore > 50 ? "Médio" : "Baixo";
  const monetization = Math.round(harmonyScore * 0.35);
  const virality = (harmonyScore / 10).toFixed(1);

  const stats = [
    {
      icon: Target,
      label: "Alcance",
      before: harmonyScore > 70 ? "Médio" : "Baixo",
      after: reachPotential,
      color: "emerald",
    },
    {
      icon: DollarSign,
      label: "Monetização",
      before: `${Math.round(monetization * 0.6)}%`,
      after: `${monetization}%`,
      color: "blue",
    },
    {
      icon: Flame,
      label: "Viralidade",
      before: `${(parseFloat(virality) * 0.7).toFixed(1)}/10`,
      after: `${virality}/10`,
      color: "orange",
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
          <BarChart3 size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Potencial de Crescimento</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Dashboard rápido de métricas</p>
        </div>
      </div>

      <div className="space-y-3">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-indigo-100 dark:border-indigo-900"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <stat.icon size={14} className={`text-${stat.color}-600 dark:text-${stat.color}-400`} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{stat.label}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Antes</p>
                <p className="text-base font-bold text-red-500 dark:text-red-400">{stat.before}</p>
              </div>

              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-500" />
              </svg>

              <div className="text-center flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Depois</p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{stat.after}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 border border-indigo-200 dark:border-indigo-800">
        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 text-center">
          🚀 Potencial de crescimento orgânico: <span className="font-black">{harmonyScore > 70 ? "Alto" : harmonyScore > 50 ? "Médio" : "Inicial"}</span>
        </p>
      </div>
    </div>
  );
}
