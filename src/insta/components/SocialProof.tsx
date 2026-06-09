
import { motion } from "framer-motion";
import { Github, Heart, Code2 } from "lucide-react";

export default function SocialProof() {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Heart size={16} className="text-red-500" fill="currentColor" />
        <span className="text-sm font-bold text-slate-900 dark:text-white">Open Source Project</span>
      </div>

      <div className="text-center mb-3">
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Feito com dedicação pela{" "}
          <a href="https://guebly.com.br" target="_blank" rel="noopener" className="font-bold text-slate-900 dark:text-white hover:underline">
            Guebly
          </a>
          , holding de tecnologia que transforma ideias em negócios reais.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <a
          href="https://github.com/Guebly/instapreview"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform text-xs font-semibold"
        >
          <Github size={12} />
          Star no GitHub
        </a>
        <a
          href="https://guebly.com.br"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:scale-105 transition-transform text-xs font-semibold"
        >
          <Code2 size={12} />
          Outros Projetos
        </a>
      </div>
    </div>
  );
}
