
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Award } from "lucide-react";

interface Props {
  currentScore: number;
  optimizedScore: number;
}

export default function CompetitorComparison({ currentScore, optimizedScore }: Props) {
  // Simulate competitor scores
  const competitor1 = Math.min(85, currentScore + Math.floor(Math.random() * 15) + 8);
  const competitor2 = Math.min(82, currentScore + Math.floor(Math.random() * 12) + 5);

  const competitors = [
    { name: "@concorrente_1", score: competitor1, status: "top" as const },
    { name: "Você (atual)", score: currentScore, status: "current" as const },
    { name: "@concorrente_2", score: competitor2, status: "competitor" as const },
    { name: "Você (otimizado)", score: optimizedScore, status: "optimized" as const },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
          <Trophy size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Análise Competitiva</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Comparação com principais concorrentes</p>
        </div>
      </div>

      <div className="space-y-3">
        {competitors.map((comp, idx) => {
          const isOptimized = comp.status === "optimized";
          const isCurrent = comp.status === "current";
          const isLeader = idx === 0;

          return (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-3 rounded-xl border-2 transition-all ${
                isOptimized
                  ? "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-emerald-400 dark:border-emerald-600"
                  : isCurrent
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700"
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isLeader && <Trophy size={14} className="text-amber-500" />}
                    <span className={`text-sm font-bold ${
                      isOptimized ? "text-emerald-700 dark:text-emerald-300" :
                      isCurrent ? "text-amber-700 dark:text-amber-300" :
                      "text-slate-700 dark:text-slate-300"
                    }`}>
                      {comp.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-2xl font-black ${
                      isOptimized ? "text-emerald-600 dark:text-emerald-400" :
                      isCurrent ? "text-amber-600 dark:text-amber-400" :
                      "text-slate-600 dark:text-slate-400"
                    }`}>
                      {comp.score}
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-600">/ 100</p>
                  </div>

                  {isOptimized && (
                    <Award size={20} className="text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
              </div>

              {isOptimized && (
                <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      +{optimizedScore - currentScore} pontos vs atual · Líder do mercado!
                    </span>
                  </div>
                </div>
              )}

              {isCurrent && (
                <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    ⚠️ Posição atual: #{competitors.findIndex(c => c.status === "current") + 1} de {competitors.length}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-white dark:bg-slate-950 border border-violet-200 dark:border-violet-800">
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          💡 <span className="font-semibold">Com otimização estratégica</span>, seu perfil pode passar de{" "}
          <span className="font-bold text-amber-600 dark:text-amber-400">#{competitors.findIndex(c => c.status === "current") + 1}</span> para{" "}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">#1</span>, superando todos os concorrentes.
        </p>
      </div>
    </div>
  );
}
