
import { motion } from "framer-motion";
import { Zap, Check } from "lucide-react";
import { TEMPLATES } from "../templates";
import type { Template } from "../types";

interface Props {
  onLoadTemplate: (template: Template) => void;
}

const NICHE_ICONS: Record<string, string> = {
  "Fitness & Saúde": "💪",
  "Gastronomia": "🍽️",
  "Moda & Estilo": "👗",
  "Beleza & Bem-estar": "💆‍♀️",
  "Arquitetura": "🏠",
  "Marketing Digital": "🚀",
};

export default function TemplateGallery({ onLoadTemplate }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg gradient-purple-pink flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Templates Rápidos</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Carregue um perfil pronto em 1 clique
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((template, idx) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onLoadTemplate(template)}
            className="group relative p-4 rounded-xl text-left transition-all
              bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
              border-2 border-slate-200 dark:border-slate-700
              hover:border-purple-400 dark:hover:border-purple-600
              hover:shadow-lg"
          >
            {/* Icon Badge */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full
              bg-gradient-to-br from-purple-500 to-pink-500
              flex items-center justify-center text-lg shadow-lg
              group-hover:scale-110 transition-transform">
              {NICHE_ICONS[template.niche] || "⭐"}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white pr-6">
                {template.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {template.niche}
              </p>

              {/* Stats Preview */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-600">
                  {template.profile.followers} seguidores
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-600">
                  {template.highlights.length} destaques
                </span>
              </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/0 to-pink-500/0
              group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all pointer-events-none" />
          </motion.button>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-2">
          <Check size={14} className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Templates otimizados para apresentações comerciais. Personalize depois de carregar.
          </p>
        </div>
      </div>
    </div>
  );
}
