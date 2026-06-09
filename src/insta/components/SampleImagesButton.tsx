
import { motion } from "framer-motion";
import { ImagePlus, Sparkles } from "lucide-react";
import { SAMPLE_IMAGES } from "../sampleImages";
import type { FeedImage } from "../types";
import { uid } from "../utils";

interface Props {
  onLoadImages: (images: FeedImage[]) => void;
}

const NICHES = [
  { id: "fitness", name: "Fitness", emoji: "💪" },
  { id: "food", name: "Food", emoji: "🍽️" },
  { id: "fashion", name: "Fashion", emoji: "👗" },
  { id: "beauty", name: "Beauty", emoji: "💄" },
  { id: "architect", name: "Arquitetura", emoji: "🏠" },
  { id: "marketing", name: "Marketing", emoji: "📊" },
];

export default function SampleImagesButton({ onLoadImages }: Props) {
  const loadSampleImages = (nicheId: string) => {
    const images = SAMPLE_IMAGES[nicheId];
    if (!images) return;

    const feedImages: FeedImage[] = images.map(url => ({
      id: uid(),
      url,
      pinned: false,
      archived: false,
    }));

    onLoadImages(feedImages);
  };

  return (
    <div className="p-6 rounded-2xl glass dark:glass-dark border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg gradient-purple-pink flex items-center justify-center">
          <ImagePlus size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fotos de Exemplo</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Carregue 9 fotos instantaneamente</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {NICHES.map((niche, idx) => (
          <motion.button
            key={niche.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadSampleImages(niche.id)}
            className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
              border-2 border-slate-200 dark:border-slate-700
              hover:border-purple-400 dark:hover:border-purple-600
              hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl group-hover:scale-110 transition-transform">{niche.emoji}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{niche.name}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">9 fotos</p>
          </motion.button>
        ))}
      </div>

      <div className="mt-3 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center gap-2">
        <Sparkles size={12} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
        <p className="text-[10px] text-purple-700 dark:text-purple-300 leading-relaxed">
          <span className="font-semibold">Demo rápida:</span> Clique em qualquer nicho para popular o feed instantaneamente
        </p>
      </div>
    </div>
  );
}
