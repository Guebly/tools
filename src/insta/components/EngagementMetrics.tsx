
import { motion } from "framer-motion";
import { TrendingUp, Heart, MessageCircle, Bookmark, Clock } from "lucide-react";

interface Props {
  followers: number;
  harmonyScore: number;
}

export default function EngagementMetrics({ followers, harmonyScore }: Props) {
  // Calculate estimates based on harmony score
  const baseEngagement = followers * 0.05; // 5% base rate
  const scoreMultiplier = harmonyScore / 100;

  const reach = Math.round(followers * (0.3 + scoreMultiplier * 0.2));
  const likes = Math.round(baseEngagement * (1 + scoreMultiplier));
  const comments = Math.round(likes * 0.08);
  const saves = Math.round(likes * 0.15);

  const improvement = Math.round(scoreMultiplier * 40);

  const metrics = [
    { icon: TrendingUp, label: "Alcance potencial", value: `${(reach / 1000).toFixed(1)}K`, improvement: `+${improvement}%` },
    { icon: Heart, label: "Curtidas esperadas", value: `${likes}-${Math.round(likes * 1.4)}`, improvement: `+${Math.round(improvement * 0.7)}%` },
    { icon: MessageCircle, label: "Comentários", value: `${comments}-${Math.round(comments * 1.5)}`, improvement: `+${Math.round(improvement * 0.48)}%` },
    { icon: Bookmark, label: "Saves", value: `${saves}-${Math.round(saves * 1.5)}`, improvement: `+${Math.round(improvement * 1.05)}%` },
  ];

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg gradient-emerald-teal flex items-center justify-center">
          <TrendingUp size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Previsão de Performance</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Estimativa baseada no score de harmonia</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-emerald-100 dark:border-emerald-900"
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {metric.label}
              </span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white mb-1">{metric.value}</p>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{metric.improvement}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-white dark:bg-slate-950 border border-emerald-100 dark:border-emerald-900 flex items-center gap-2">
        <Clock size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Melhor horário para postar</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Segunda a Quarta, 18h - 20h</p>
        </div>
      </div>
    </div>
  );
}
