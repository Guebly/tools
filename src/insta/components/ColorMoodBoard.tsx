
import { motion } from "framer-motion";
import { Palette, Heart } from "lucide-react";

interface Props {
  dominantColors: string[];
  palette: "warm" | "cool" | "neutral" | "vibrant";
}

const MOOD_MAPPING: Record<string, { emotion: string; bestFor: string; vibe: string }> = {
  warm: {
    emotion: "Energia, Entusiasmo, Paixão",
    bestFor: "Lifestyle, Travel, Food",
    vibe: "Acolhedor e Estimulante",
  },
  cool: {
    emotion: "Calma, Profissionalismo, Confiança",
    bestFor: "Tech, Business, Health",
    vibe: "Sereno e Sofisticado",
  },
  neutral: {
    emotion: "Elegância, Minimalismo, Clareza",
    bestFor: "Fashion, Architecture, Design",
    vibe: "Atemporal e Refinado",
  },
  vibrant: {
    emotion: "Alegria, Criatividade, Ousadia",
    bestFor: "Arte, Moda, Entretenimento",
    vibe: "Energético e Expressivo",
  },
};

export default function ColorMoodBoard({ dominantColors, palette }: Props) {
  const mood = MOOD_MAPPING[palette] || MOOD_MAPPING.neutral;
  const paletteName = palette.charAt(0).toUpperCase() + palette.slice(1);

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
          <Palette size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Color Mood Board</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Análise de paleta e emoções</p>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Paleta Dominante</p>
        <div className="flex gap-2 flex-wrap">
          {dominantColors.length > 0 ? (
            dominantColors.slice(0, 8).map((color, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: idx * 0.05, type: "spring" }}
                className="group relative"
              >
                <div
                  className="w-14 h-14 rounded-xl shadow-lg ring-2 ring-white dark:ring-slate-900
                    hover:scale-110 transition-transform cursor-pointer"
                  style={{ background: color }}
                  title={color}
                />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono
                  text-slate-500 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {color}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="w-full p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-600">Adicione fotos para ver paleta</p>
            </div>
          )}
        </div>
      </div>

      {/* Mood Analysis */}
      {dominantColors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-orange-100 dark:border-orange-900">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎨</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo de Paleta</span>
            </div>
            <p className="text-base font-bold text-orange-600 dark:text-orange-400">{paletteName}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{mood.vibe}</p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-orange-100 dark:border-orange-900">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={14} className="text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Emoções Transmitidas</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{mood.emotion}</p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-orange-100 dark:border-orange-900">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ideal Para</span>
            </div>
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{mood.bestFor}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
