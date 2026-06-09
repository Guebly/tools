import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Topbar            from "../insta/components/Topbar";
import Sidebar           from "../insta/components/Sidebar";
import PhonePreview      from "../insta/components/PhonePreview";
import DesktopPreview    from "../insta/components/DesktopPreview";
import PresentationMode  from "../insta/components/PresentationMode";
import ToastContainer    from "../insta/components/Toast";
import ConfirmDialog     from "../insta/components/ConfirmDialog";
import type { ToastMessage } from "../insta/components/Toast";
import { exportPreview }  from "../insta/exportPreview";
import { exportPDFProposal } from "../insta/pdfExport";
import { analyzeFeed } from "../insta/feedAnalyzer";
import { saveSession, loadSession, hasSavedSession, formatBytes } from "../insta/session";
import type { ProfileData, Highlight, FeedImage, AppTheme, IgTheme, DeviceView, SidebarTab, Template } from "../insta/types";
import { uid, saveTheme, loadTheme, saveIgTheme, loadIgTheme } from "../insta/utils";

/* ── Defaults ── */
const DEFAULT_PROFILE: ProfileData = {
  username: "", displayName: "", bio: "", link: "", bioLinks: [],
  posts: "0", autoCount: true, followers: "0", following: "0",
  avatarUrl: null, verified: "none", category: "",
  ctaLabel: "", storyActive: true, viewMode: "owner",
};
const mkHL = () => [
  { id: uid(), name: "Viagem",   coverUrl: null },
  { id: uid(), name: "Trabalho", coverUrl: null },
  { id: uid(), name: "Família",  coverUrl: null },
];

/* ── Toast hook ── */
function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const add = useCallback((type: ToastMessage["type"], title: string, body?: string) => {
    const id = Date.now();
    setToasts(t => [...t, { id, type, title, body }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
  }, []);
  const remove = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, add, remove };
}

/* ════════════════════════════════════════════════════════════════════ */
export default function InstaPreview() {
  const [appTheme,    setAppTheme]    = useState<AppTheme>("dark");
  const [igTheme,     setIgTheme]     = useState<IgTheme>("light");
  const [deviceView,  setDeviceView]  = useState<DeviceView>("mobile");
  const [activeTab,       setActiveTab]       = useState<SidebarTab>("profile");
  const [profile,         setProfile]         = useState<ProfileData>(DEFAULT_PROFILE);
  const [highlights,      setHighlights]      = useState<Highlight[]>(mkHL());
  const [feed,            setFeed]            = useState<FeedImage[]>([]);
  const [exporting,       setExporting]       = useState(false);
  const [exportingPDF,    setExportingPDF]    = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [hasSaved,        setHasSaved]        = useState(false);
  const [feedAnalysis,    setFeedAnalysis]    = useState<any>(null);
  const [presentationMode, setPresentationMode] = useState(false);

  // Confirm dialogs
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmLoad, setConfirmLoad] = useState(false);
  const [confirmTemplate, setConfirmTemplate] = useState<{ open: boolean; template: Template | null }>({ open: false, template: null });

  const previewRef = useRef<HTMLDivElement>(null);
  const { toasts, add: addToast, remove: removeToast } = useToast();

  /* ── Boot: load saved prefs ── */
  useEffect(() => {
    const at = loadTheme(), it = loadIgTheme();
    if (at) setAppTheme(at);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setAppTheme("dark");
    if (it) setIgTheme(it);
    setHasSaved(hasSavedSession());
  }, []);

  /* ── Apply app theme class to <html> ── */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", appTheme === "dark");
    saveTheme(appTheme);
  }, [appTheme]);

  /* ── Auto-close sidebar at lg breakpoint ── */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* ── Feed helper (autoCount sync) ── */
  const updateFeed = useCallback((f: FeedImage[]) => {
    setFeed(f);
    setProfile(prev => prev.autoCount ? { ...prev, posts: String(f.length) } : prev);
  }, []);

  const updateProfile = useCallback((p: Partial<ProfileData>) =>
    setProfile(prev => ({ ...prev, ...p })), []);

  /* ── Export PNG ── */
  const handleExport = useCallback(async () => {
    if (!previewRef.current || exporting) return;
    setExporting(true);
    try {
      await exportPreview({ frameEl: previewRef.current, username: profile.username });
      addToast("success", "PNG exportado!", "Verifique sua pasta de downloads.");
    } catch {
      addToast("error", "Falha ao exportar", "Tente novamente.");
    } finally { setExporting(false); }
  }, [exporting, profile.username, addToast]);

  /* ── Export PDF ── */
  const handleExportPDF = useCallback(async () => {
    if (exportingPDF) return;
    setExportingPDF(true);
    try {
      await exportPDFProposal({
        profile,
        analysis: feedAnalysis,
      });
      addToast("success", "PDF exportado!", "Apresente para seu cliente.");
    } catch {
      addToast("error", "Falha ao exportar PDF", "Tente novamente.");
    } finally { setExportingPDF(false); }
  }, [exportingPDF, profile, feedAnalysis, addToast]);

  /* ── Update feed analysis ── */
  useEffect(() => {
    if (feed.length === 0) {
      setFeedAnalysis(null);
      return;
    }
    analyzeFeed(feed).then(setFeedAnalysis);
  }, [feed]);

  /* ── Reset ── */
  const handleReset = useCallback(() => {
    setConfirmReset(true);
  }, []);

  const doReset = useCallback(() => {
    setProfile(DEFAULT_PROFILE); setHighlights(mkHL()); setFeed([]);
    addToast("info", "Tudo resetado.");
  }, [addToast]);

  /* ── Save / Load session ── */
  const handleSaveSession = useCallback(() => {
    const result = saveSession(profile, highlights, feed);
    if (result.ok) {
      setHasSaved(true);
      addToast("success", "Sessão salva!", `${formatBytes(result.bytes)} guardados no navegador.`);
    } else {
      addToast("error", "Não foi possível salvar", result.error);
    }
  }, [profile, highlights, feed, addToast]);

  const handleLoadSession = useCallback(() => {
    const session = loadSession();
    if (!session) { addToast("error", "Nenhuma sessão encontrada."); return; }
    setConfirmLoad(true);
  }, [addToast]);

  const doLoadSession = useCallback(() => {
    const session = loadSession();
    if (!session) return;
    setProfile({ ...DEFAULT_PROFILE, ...session.profile });
    setHighlights(session.highlights);
    setFeed(session.feed);
    const d = new Date(session.savedAt);
    addToast("success", "Sessão carregada!",
      `Salva em ${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`
    );
  }, [addToast]);

  /* ── Load template ── */
  const handleLoadTemplate = useCallback((template: Template) => {
    setConfirmTemplate({ open: true, template });
  }, []);

  const doLoadTemplate = useCallback(() => {
    if (!confirmTemplate.template) return;
    setProfile({ ...DEFAULT_PROFILE, ...confirmTemplate.template.profile });
    setHighlights(confirmTemplate.template.highlights);
    setFeed(confirmTemplate.template.feed);
    setActiveTab("profile");
    addToast("success", `Template "${confirmTemplate.template.name}" carregado!`, "Personalize agora com suas próprias informações.");
  }, [confirmTemplate, addToast]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        setPresentationMode(p => !p);
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSaveSession();
            break;
          case 'e':
            e.preventDefault();
            if (!exporting) handleExport();
            break;
          case 'r':
            e.preventDefault();
            handleReset();
            break;
          case 'p':
            e.preventDefault();
            setPresentationMode(true);
            break;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSaveSession, handleExport, handleReset, exporting]);

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0a0a]">
      <Topbar
        appTheme={appTheme}
        onToggleApp={() => setAppTheme(t => t === "dark" ? "light" : "dark")}
        onReset={handleReset}
        onExport={handleExport}
        onExportPDF={handleExportPDF}
        isExporting={exporting}
        isExportingPDF={exportingPDF}
        onSaveSession={handleSaveSession}
        onLoadSession={handleLoadSession}
        hasSaved={hasSaved}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onPresentationMode={() => setPresentationMode(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Overlay (mobile only) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <div className={[
          "z-50 flex-shrink-0",
          "lg:relative lg:translate-x-0 lg:flex",
          "fixed top-0 bottom-0 left-0",
          "transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}>
          <Sidebar
            activeTab={activeTab}   onTabChange={setActiveTab}
            profile={profile}       onProfileChange={updateProfile}
            highlights={highlights} onHighlightsChange={setHighlights}
            feed={feed}             onFeedChange={updateFeed}
            onClose={() => setSidebarOpen(false)}
            onLoadTemplate={handleLoadTemplate}
          />
        </div>

        {/* ── Preview canvas ── */}
        <main className="relative flex-1 min-w-0 overflow-auto
          bg-slate-100 dark:bg-[#0a0a0a]
          flex flex-col items-center py-5 px-3 sm:px-6 gap-4">

          {/* Dot grid bg */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

          {/* ── Controls ── */}
          <div className="relative z-10 flex items-center gap-2 flex-wrap">

            {/* Device toggle */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161616]">
              {(["mobile","desktop"] as DeviceView[]).map(mode => (
                <button key={mode} onClick={() => setDeviceView(mode)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all ${
                    deviceView === mode
                      ? "ig-gradient text-white"
                      : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}>
                  {mode === "mobile" ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeWidth="3"/>
                      </svg>
                      <span className="hidden sm:inline">Mobile</span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <path d="M8 21h8M12 17v4"/>
                      </svg>
                      <span className="hidden sm:inline">Desktop</span>
                    </>
                  )}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-800" />

            {/* IG theme toggle */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161616]">
              {(["light","dark"] as IgTheme[]).map(t => (
                <button key={t}
                  onClick={() => { setIgTheme(t); saveIgTheme(t); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all ${
                    igTheme === t
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}>
                  {t === "light" ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                      </svg>
                      <span className="hidden sm:inline">IG Light</span>
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                      </svg>
                      <span className="hidden sm:inline">IG Dark</span>
                    </>
                  )}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 dark:text-slate-600 hidden xl:block">
              Arraste as fotos para reorganizar
            </span>
          </div>

          {/* ── Preview ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={deviceView}
              ref={previewRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`relative z-10 ${deviceView === "mobile" ? "preview-phone" : "preview-desktop"}`}
            >
              {deviceView === "mobile"
                ? <PhonePreview   profile={profile} highlights={highlights} feed={feed} onFeedReorder={updateFeed} igTheme={igTheme} />
                : <DesktopPreview profile={profile} highlights={highlights} feed={feed} onFeedReorder={updateFeed} igTheme={igTheme} />
              }
            </motion.div>
          </AnimatePresence>

          {/* ── Footer ── */}
          <a href="https://www.guebly.com.br" target="_blank" rel="noopener noreferrer"
            className="relative z-10 flex items-center gap-2 pb-6
              text-[11px] text-slate-400 dark:text-slate-600
              hover:text-slate-600 dark:hover:text-slate-400 transition">
            <img src="https://www.guebly.com.br/guebly.png" alt=""
              className="w-4 h-4 rounded object-contain opacity-60" />
            InstaPreview é open-source · feito pela Guebly
          </a>
        </main>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <PresentationMode
        isOpen={presentationMode}
        onClose={() => setPresentationMode(false)}
        profile={profile}
        highlights={highlights}
        feed={feed}
        onFeedReorder={updateFeed}
        igTheme={igTheme}
      />

      <ConfirmDialog
        isOpen={confirmReset}
        title="Resetar tudo?"
        message="Todas as fotos e configurações serão perdidas. Esta ação não pode ser desfeita."
        confirmLabel="Resetar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
      />

      <ConfirmDialog
        isOpen={confirmLoad}
        title="Carregar sessão salva?"
        message="O estado atual do perfil será substituído pela sessão salva anteriormente."
        confirmLabel="Carregar"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={doLoadSession}
        onCancel={() => setConfirmLoad(false)}
      />

      <ConfirmDialog
        isOpen={confirmTemplate.open}
        title={`Carregar template "${confirmTemplate.template?.name}"?`}
        message="O perfil atual será substituído pelo template selecionado."
        confirmLabel="Carregar"
        cancelLabel="Cancelar"
        variant="info"
        onConfirm={doLoadTemplate}
        onCancel={() => setConfirmTemplate({ open: false, template: null })}
      />
    </div>
  );
}
