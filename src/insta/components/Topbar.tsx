
import React from "react";
import {
  Moon, Sun, RotateCcw, Github, Download, Loader2, Save,
  FolderOpen, Menu, FileText, Presentation, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import IgIcon from "./IgIcon";
import type { AppTheme } from "../types";

interface TopbarProps {
  appTheme:            AppTheme;
  onToggleApp:         () => void;
  onReset:             () => void;
  onExport:            () => Promise<void>;
  onExportPDF:         () => Promise<void>;
  isExporting:         boolean;
  isExportingPDF:      boolean;
  onSaveSession:       () => void;
  onLoadSession:       () => void;
  hasSaved:            boolean;
  onToggleSidebar:     () => void;
  onPresentationMode:  () => void;
}

/* ── Shared button base ── */
const Btn = ({
  onClick, title, disabled, children, className = "",
}: {
  onClick?: () => void; title?: string; disabled?: boolean;
  children: React.ReactNode; className?: string;
}) => (
  <button
    onClick={onClick} title={title} disabled={disabled}
    className={[
      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold",
      "border border-slate-200 dark:border-slate-800",
      "bg-white dark:bg-slate-900/60",
      "text-slate-600 dark:text-slate-400",
      "hover:bg-slate-50 dark:hover:bg-slate-800",
      "hover:text-slate-900 dark:hover:text-white",
      "transition-all duration-150",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

export default function Topbar({
  appTheme, onToggleApp, onReset, onExport, onExportPDF, isExporting, isExportingPDF,
  onSaveSession, onLoadSession, hasSaved, onToggleSidebar, onPresentationMode,
}: TopbarProps) {
  return (
    <header className="flex-shrink-0 z-20">
      {/* IG gradient top line */}
      <div className="h-[2px] ig-gradient w-full" />

      {/* Main bar */}
      <div className="h-13 flex items-center justify-between px-3 sm:px-4 gap-2 py-2
        border-b border-slate-200 dark:border-slate-800
        bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl">

        {/* ── Left: back + hamburger + branding ── */}
        <div className="flex items-center gap-2 min-w-0">

          {/* Hamburger — mobile only */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg
              border border-slate-200 dark:border-slate-800
              bg-white dark:bg-slate-900/60
              text-slate-500 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0"
            title="Abrir painel"
          >
            <Menu size={15} />
          </button>

          {/* Back to Tools */}
          <Link
            to="/"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
              text-[11px] font-semibold
              border border-slate-200 dark:border-slate-800
              bg-white dark:bg-slate-900/60
              text-slate-500 dark:text-slate-500
              hover:bg-slate-50 dark:hover:bg-slate-800
              hover:text-slate-800 dark:hover:text-slate-200
              transition-all duration-150 flex-shrink-0"
            title="Voltar para Guebly Tools"
          >
            <ArrowLeft size={12} />
            <img src="/logo-64.png" alt="Guebly" className="w-3.5 h-3.5 rounded object-contain" />
            <span className="hidden md:inline">Tools</span>
          </Link>

          {/* Separator */}
          <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-800 flex-shrink-0" />

          {/* Branding */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg ig-gradient flex items-center justify-center flex-shrink-0">
              <IgIcon size={16} />
            </div>
            <span className="font-black text-slate-900 dark:text-white text-[14px] tracking-tight hidden sm:block">
              InstaPreview
            </span>
            <span className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5
              rounded-full bg-gradient-to-r from-ig-orange to-ig-purple text-white leading-none hidden sm:block"
              style={{ background: "linear-gradient(135deg,#f09433,#bc1888)" }}
            >
              beta
            </span>
          </div>
        </div>

        {/* ── Center: Guebly credit — hidden on small screens ── */}
        <a
          href="https://www.guebly.com.br"
          target="_blank" rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl flex-shrink-0
            border border-slate-100 dark:border-slate-800/60
            bg-slate-50 dark:bg-slate-900/40
            text-slate-500 dark:text-slate-500
            hover:text-slate-700 dark:hover:text-slate-300
            hover:border-slate-200 dark:hover:border-slate-700
            transition-all group"
        >
          <img src="/logo-64.png" alt="Guebly"
            className="w-4 h-4 rounded object-contain" />
          <span className="text-[11px] font-bold">by Guebly</span>
        </a>

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Session group */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl
            border border-slate-200 dark:border-slate-800
            bg-slate-50 dark:bg-slate-900/40">
            <Btn onClick={onSaveSession} title="Salvar sessão (Ctrl+S)">
              <Save size={12} />
              <span className="hidden md:inline">Salvar</span>
            </Btn>
            <Btn
              onClick={onLoadSession}
              title={hasSaved ? "Carregar sessão salva" : "Nenhuma sessão salva"}
              disabled={!hasSaved}
              className={hasSaved
                ? "border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                : ""}
            >
              <FolderOpen size={12} />
              {hasSaved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
              <span className="hidden md:inline">Carregar</span>
            </Btn>
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-800" />

          {/* Export group */}
          <div className="flex items-center gap-1">
            {/* GitHub */}
            <a
              href="https://github.com/guebly/instapreview"
              target="_blank" rel="noopener noreferrer"
              title="Ver no GitHub"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                border border-slate-200 dark:border-slate-800
                bg-white dark:bg-slate-900/60
                text-slate-600 dark:text-slate-400
                hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Github size={12} />
              <span>GitHub</span>
            </a>

            {/* Export PNG */}
            <button
              onClick={onExport}
              disabled={isExporting}
              title="Exportar como PNG (Ctrl+E)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                border border-slate-200 dark:border-slate-800
                bg-white dark:bg-slate-900/60
                text-slate-700 dark:text-slate-300
                hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900
                transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              <span className="hidden sm:inline">{isExporting ? "..." : "PNG"}</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={onExportPDF}
              disabled={isExportingPDF}
              title="Exportar proposta em PDF"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                border ig-gradient text-white
                hover:opacity-90 transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-sm"
              style={{ boxShadow: "0 2px 10px rgba(220,39,67,0.25)" }}
            >
              {isExportingPDF ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
              <span className="hidden lg:inline">{isExportingPDF ? "..." : "PDF"}</span>
            </button>

            {/* Presentation */}
            <button
              onClick={onPresentationMode}
              title="Modo apresentação (F11)"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                border border-emerald-200 dark:border-emerald-900
                bg-emerald-50 dark:bg-emerald-950/30
                text-emerald-600 dark:text-emerald-400
                hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
            >
              <Presentation size={12} />
              <span className="hidden xl:inline">Apresentar</span>
            </button>
          </div>

          {/* Separator */}
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />

          {/* Reset */}
          <button
            onClick={onReset}
            title="Resetar tudo (Ctrl+R)"
            className="flex items-center justify-center w-8 h-8 rounded-lg
              border border-slate-200 dark:border-slate-800
              bg-white dark:bg-slate-900/60
              text-slate-500 dark:text-slate-400
              hover:bg-red-50 hover:text-red-500 hover:border-red-200
              dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900
              transition-all"
          >
            <RotateCcw size={13} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleApp}
            title={appTheme === "dark" ? "Modo claro" : "Modo escuro"}
            className="flex items-center justify-center w-8 h-8 rounded-lg
              border border-slate-200 dark:border-slate-800
              bg-white dark:bg-slate-900/60
              text-slate-600 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {appTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}
