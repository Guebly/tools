
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Palette, Lightbulb } from "lucide-react";
import type { FeedImage, FeedAnalysis as FeedAnalysisType, ProfileData } from "../types";
import { analyzeFeed } from "../feedAnalyzer";
import BeforeAfterComparison from "./BeforeAfterComparison";
import EngagementMetrics from "./EngagementMetrics";
import CompetitorComparison from "./CompetitorComparison";
import GridPatternSelector from "./GridPatternSelector";
import QuickStats from "./QuickStats";
import ColorMoodBoard from "./ColorMoodBoard";
import SocialProof from "./SocialProof";

interface Props {
  feed: FeedImage[];
  profile: ProfileData;
  onFeedReorder: (f: FeedImage[]) => void;
}

export default function FeedAnalysis({ feed, profile, onFeedReorder }: Props) {
  const [analysis, setAnalysis] = useState<FeedAnalysisType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (feed.length === 0) {
      setAnalysis(null);
      return;
    }

    setLoading(true);
    analyzeFeed(feed)
      .then(setAnalysis)
      .finally(() => setLoading(false));
  }, [feed]);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl glass dark:glass-dark">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-purple-pink flex items-center justify-center">
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Analisando Feed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Processando imagens...</p>
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-shimmer"
                style={{ width: '100%', backgroundSize: '200% 100%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center">
        <Sparkles size={32} className="mx-auto mb-3 text-slate-400 dark:text-slate-600" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Adicione fotos ao feed para ver a análise com IA
        </p>
      </div>
    );
  }

  const { harmony, dominantColors, palette, aesthetic, recommendations } = analysis;

  // Simulate "before" score (could be saved in localStorage for real comparison)
  const beforeScore = Math.max(20, harmony - 25);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Before/After Comparison */}
      {harmony > 50 && (
        <BeforeAfterComparison
          beforeScore={beforeScore}
          afterScore={harmony}
        />
      )}
      {/* Harmony Score */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-purple-pink flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Análise do Feed</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Powered by IA</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Score Circle */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeDasharray={`${(harmony / 100) * 251} 251`}
                fill="none"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black bg-gradient-purple-pink bg-clip-text text-transparent">
                {harmony}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-baseline gap-2">
              <TrendingUp size={14} className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Harmonia Visual
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <Palette size={14} className="text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Paleta <span className="font-semibold capitalize">{palette}</span> · Estética{" "}
                <span className="font-semibold capitalize">{aesthetic}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dominant Colors */}
      {dominantColors.length > 0 && (
        <div className="p-6 rounded-2xl glass dark:glass-dark">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={16} className="text-slate-600 dark:text-slate-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cores Dominantes</h4>
          </div>
          <div className="flex gap-2 flex-wrap">
            {dominantColors.map((color, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div
                  className="w-12 h-12 rounded-xl shadow-lg ring-2 ring-white dark:ring-slate-900
                    hover:scale-110 transition-transform cursor-pointer"
                  style={{ background: color }}
                  title={color}
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono
                  text-slate-500 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {color}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100 dark:border-blue-900">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recomendações</h4>
        </div>
        <div className="space-y-2">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <span className="text-blue-500 dark:text-blue-400 flex-shrink-0">💡</span>
              <p className="leading-relaxed">{rec}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Competitor Comparison */}
      <CompetitorComparison currentScore={beforeScore} optimizedScore={harmony} />

      {/* Engagement Metrics */}
      <EngagementMetrics
        followers={parseInt(profile.followers.replace(/\D/g, "")) || 1000}
        harmonyScore={harmony}
      />

      {/* Quick Stats */}
      <QuickStats harmonyScore={harmony} feedCount={feed.length} />

      {/* Color Mood Board */}
      <ColorMoodBoard dominantColors={dominantColors} palette={palette} />

      {/* Grid Pattern Selector */}
      <GridPatternSelector feed={feed} onApplyPattern={onFeedReorder} />

      {/* Open Source Badge */}
      <SocialProof />
    </motion.div>
  );
}
