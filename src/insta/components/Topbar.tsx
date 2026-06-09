
import React from "react";
import { Moon, Sun, RotateCcw, Github, Download, Loader2, Save, FolderOpen, Menu, FileText, Presentation, ArrowLeft } from "lucide-react";
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

const Btn = ({ onClick, title, disabled, children, className = "" }: {
  onClick?: () => void; title?: string; disabled?: boolean;
  children: React.ReactNode; className?: string;
}) => (
  <button
    onClick={onClick} title={title} disabled={disabled}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
      border border-slate-200 dark:border-slate-800
      text-slate-600 dark:text-slate-400
      hover:bg-slate-100 dark:hover:bg-slate-800
      transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
  >{children}</button>
);

export default function Topbar({
  appTheme, onToggleApp, onReset, onExport, onExportPDF, isExporting, isExportingPDF,
  onSaveSession, onLoadSession, hasSaved, onToggleSidebar, onPresentationMode,
}: TopbarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-5
      border-b border-slate-200 dark:border-slate-800
      bg-white dark:bg-[#0e0e0e] flex-shrink-0 z-20 gap-2">

      {/* ── Left ── */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg
            border border-slate-200 dark:border-slate-800
            text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0"
          title="Abrir painel"
        >
          <Menu size={16} />
        </button>

        {/* Back to Tools */}
        <Link
          to="/"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
            border border-slate-200 dark:border-slate-800
            text-slate-500 dark:text-slate-500
            hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300
            transition flex-shrink-0"
          title="Voltar para Guebly Tools"
        >
          <ArrowLeft size={13} />
          <img src="/logo-64.png" alt="Guebly" className="w-3.5 h-3.5 rounded object-contain" />
          <span className="hidden md:inline">Tools</span>
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <IgIcon size={20} />
          <span className="font-black text-slate-900 dark:text-white text-[14px] tracking-tight hidden sm:block">
            InstaPreview
          </span>
          <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5
            rounded-full ig-gradient text-white leading-none hidden sm:block">
            beta
          </span>
        </div>
      </div>

      {/* ── Center: Guebly ── */}
      <a
        href="https://www.guebly.com.br"
        target="_blank" rel="noopener noreferrer"
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0
          border border-slate-200 dark:border-slate-800
          hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
      >
        <img src="/logo-64.png" alt="Guebly"
          className="w-4 h-4 rounded object-contain" />
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500
          group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
          by Guebly
        </span>
      </a>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Session: Save */}
        <Btn onClick={onSaveSession} title="Salvar sessão no navegador">
          <Save size={13} />
          <span className="hidden sm:inline">Salvar</span>
        </Btn>

        {/* Session: Load */}
        <Btn
          onClick={onLoadSession}
          title={hasSaved ? "Carregar sessão salva" : "Nenhuma sessão salva"}
          disabled={!hasSaved}
          className={hasSaved ? "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" : ""}
        >
          <FolderOpen size={13} />
          <span className="hidden sm:inline">Carregar</span>
          {hasSaved && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 flex-shrink-0" />
          )}
        </Btn>

        {/* GitHub */}
        <a
          href="https://github.com/guebly/instapreview"
          target="_blank" rel="noopener noreferrer"
          title="Ver no GitHub"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
            border border-slate-200 dark:border-slate-800
            text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Github size={13} />
          <span>Open-source</span>
        </a>

        {/* Export PNG */}
        <Btn onClick={onExport} disabled={isExporting} title="Exportar como PNG">
          {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          <span className="hidden sm:inline">{isExporting ? "…" : "PNG"}</span>
        </Btn>

        {/* Export PDF */}
        <Btn
          onClick={onExportPDF}
          disabled={isExportingPDF}
          title="Exportar proposta em PDF"
          className="hidden md:flex border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
        >
          {isExportingPDF ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
          <span className="hidden lg:inline">{isExportingPDF ? "…" : "PDF"}</span>
        </Btn>

        {/* Presentation Mode */}
        <Btn
          onClick={onPresentationMode}
          title="Modo apresentação (F11)"
          className="hidden lg:flex border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
        >
          <Presentation size={13} />
          <span className="hidden xl:inline">Apresentar</span>
        </Btn>

        {/* Reset */}
        <Btn onClick={onReset} title="Resetar tudo">
          <RotateCcw size={13} />
        </Btn>

        {/* App theme toggle */}
        <button
          onClick={onToggleApp}
          title={appTheme === "dark" ? "Modo claro" : "Modo escuro"}
          className="flex items-center justify-center w-8 h-8 rounded-lg
            border border-slate-200 dark:border-slate-800
            text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {appTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
}
