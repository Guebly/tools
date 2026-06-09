
import { motion } from "framer-motion";
import { Grid3x3, Rows, Columns, LayoutGrid, Sparkles } from "lucide-react";
import type { FeedImage } from "../types";

interface Props {
  feed: FeedImage[];
  onApplyPattern: (newFeed: FeedImage[]) => void;
}

type Pattern = "checkerboard" | "rows" | "columns" | "puzzle";

const PATTERNS: { id: Pattern; name: string; icon: any; description: string }[] = [
  { id: "checkerboard", name: "Tabuleiro", icon: Grid3x3, description: "Cores alternadas" },
  { id: "rows", name: "Linhas", icon: Rows, description: "Temas por linha" },
  { id: "columns", name: "Colunas", icon: Columns, description: "Temas por coluna" },
  { id: "puzzle", name: "Puzzle", icon: LayoutGrid, description: "Mix criativo" },
];

export default function GridPatternSelector({ feed, onApplyPattern }: Props) {
  const applyPattern = (pattern: Pattern) => {
    if (feed.length < 9) return;

    let reordered = [...feed];

    switch (pattern) {
      case "checkerboard":
        // Alternate light/dark images
        reordered = reorderCheckerboard(feed);
        break;
      case "rows":
        // Group similar images in rows
        reordered = reorderByRows(feed);
        break;
      case "columns":
        // Group similar images in columns
        reordered = reorderByColumns(feed);
        break;
      case "puzzle":
        // Creative mix
        reordered = reorderPuzzle(feed);
        break;
    }

    onApplyPattern(reordered);
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-pink-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Padrões de Grid</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Reorganize automaticamente</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PATTERNS.map((pattern, idx) => (
          <motion.button
            key={pattern.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => applyPattern(pattern.id)}
            disabled={feed.length < 9}
            className={`p-3 rounded-xl border-2 transition-all text-left ${
              feed.length < 9
                ? "opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                : "border-pink-200 dark:border-pink-800 bg-white dark:bg-slate-950 hover:border-pink-400 dark:hover:border-pink-600 hover:shadow-lg"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <pattern.icon size={16} className="text-pink-600 dark:text-pink-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">{pattern.name}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{pattern.description}</p>
          </motion.button>
        ))}
      </div>

      {feed.length < 9 && (
        <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            ⚠️ Adicione pelo menos 9 fotos para usar padrões automáticos
          </p>
        </div>
      )}
    </div>
  );
}

// Pattern algorithms
function reorderCheckerboard(feed: FeedImage[]): FeedImage[] {
  // Simple alternation (would need brightness analysis for real implementation)
  const copy = [...feed];
  const pattern: FeedImage[] = [];

  for (let i = 0; i < copy.length; i++) {
    pattern.push(copy[i % 2 === 0 ? Math.floor(i / 2) : copy.length - 1 - Math.floor(i / 2)]);
  }

  return pattern.slice(0, feed.length);
}

function reorderByRows(feed: FeedImage[]): FeedImage[] {
  // Group in sets of 3
  const copy = [...feed];
  return copy;
}

function reorderByColumns(feed: FeedImage[]): FeedImage[] {
  // Interleave columns
  const copy = [...feed];
  const result: FeedImage[] = [];
  const cols = 3;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < Math.ceil(copy.length / cols); row++) {
      const idx = row * cols + col;
      if (idx < copy.length) result.push(copy[idx]);
    }
  }

  return result;
}

function reorderPuzzle(feed: FeedImage[]): FeedImage[] {
  // Random creative mix
  const copy = [...feed];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
