
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";

interface Props {
  beforeScore: number;
  afterScore: number;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterComparison({
  beforeScore,
  afterScore,
  beforeLabel = "Antes",
  afterLabel = "Depois (Otimizado)",
}: Props) {
  const improvement = afterScore - beforeScore;
  const improvementPercent = beforeScore > 0 ? ((improvement / beforeScore) * 100).toFixed(0) : "0";

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg gradient-blue-cyan flex items-center justify-center">
          <TrendingUp size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Comparação de Performance</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Score de harmonia visual</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Before */}
        <div className="text-center p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">{beforeLabel}</p>
          <p className="text-3xl font-black text-red-500 dark:text-red-400">{beforeScore}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">/ 100</p>
        </div>

        {/* Arrow & Improvement */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            className="flex items-center gap-1"
          >
            <ArrowRight size={20} className="text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          {improvement > 0 && (
            <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +{improvement} ({improvementPercent}%)
              </p>
            </div>
          )}
        </div>

        {/* After */}
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">{afterLabel}</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{afterScore}</p>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-600 mt-1">/ 100</p>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-4 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {improvement > 20 ? (
            <>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Excelente melhoria!</span>{" "}
              Com essas otimizações, seu feed terá muito mais harmonia visual e atrairá mais engajamento.
            </>
          ) : improvement > 10 ? (
            <>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Boa evolução!</span>{" "}
              Seu feed está mais consistente e profissional.
            </>
          ) : improvement > 0 ? (
            <>
              <span className="font-semibold text-slate-600 dark:text-slate-400">Progresso detectado.</span>{" "}
              Continue aplicando as recomendações para melhorar ainda mais.
            </>
          ) : (
            <>
              <span className="font-semibold text-slate-600 dark:text-slate-400">Mantenha a qualidade.</span>{" "}
              Seu feed já está otimizado!
            </>
          )}
        </p>
      </div>
    </div>
  );
}
