import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  Copy,
  Eraser,
  PlayCircle,
  Linkedin,
  Instagram,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Scissors,
  FileText,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  formatForInstagram,
  formatForLinkedIn,
  formatForWhatsApp,
  splitByMaxLen,
} from "../lib/textFormatters";

type PlatformKey = "linkedin" | "instagram" | "whatsapp";

const PLATFORM: Record<
  PlatformKey,
  { label: string; icon: React.ReactNode; helper: string; maxDefault: number }
> = {
  linkedin: {
    label: "LinkedIn",
    icon: <Linkedin size={15} />,
    helper: "LinkedIn não aplica markdown. O destaque é visual (Unicode).",
    maxDefault: 3500,
  },
  instagram: {
    label: "Instagram",
    icon: <Instagram size={15} />,
    helper: "Instagram não aplica markdown. O destaque é visual (Unicode).",
    maxDefault: 2200,
  },
  whatsapp: {
    label: "WhatsApp",
    icon: <MessageCircle size={15} />,
    helper: "WhatsApp suporta *negrito* e _itálico_. Aqui a conversão é real.",
    maxDefault: 3500,
  },
};

function format(platform: PlatformKey, text: string) {
  if (platform === "whatsapp") return formatForWhatsApp(text);
  if (platform === "instagram") return formatForInstagram(text);
  return formatForLinkedIn(text);
}

// Toast system
type ToastType = { id: number; type: "success" | "error" | "info"; message: string };

function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const addToast = useCallback((type: ToastType["type"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);
  return { toasts, addToast };
}

function ToastContainer({ toasts }: { toasts: ToastType[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none w-[92%] md:w-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md",
            t.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : t.type === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-blue-500/10 border-blue-500/30 text-blue-400",
          ].join(" ")}
        >
          {t.type === "success" ? (
            <CheckCircle size={16} />
          ) : t.type === "error" ? (
            <XCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="text-sm font-semibold">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export default function TextFormatter() {
  const { toasts, addToast } = useToast();
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === "dark";

  const [platform, setPlatform] = useState<PlatformKey>("linkedin");
  const [input, setInput] = useState("");
  const [executed, setExecuted] = useState("");
  const [splitEnabled, setSplitEnabled] = useState(true);
  const [maxLen, setMaxLen] = useState<number>(PLATFORM.linkedin.maxDefault);

  useEffect(() => {
    setMaxLen(PLATFORM[platform].maxDefault);
  }, [platform]);

  const preview = useMemo(() => format(platform, input), [platform, input]);
  const isStale = executed !== preview;

  const chunks = useMemo(() => {
    const out = executed || "";
    if (!splitEnabled) return [out];
    return splitByMaxLen(out, Math.max(200, maxLen || 3500));
  }, [executed, splitEnabled, maxLen]);

  const outText = useMemo(() => chunks.join("\n\n"), [chunks]);

  function onExecute() {
    setExecuted(preview);
    addToast("success", "Saída atualizada.");
  }

  function onClear() {
    setInput("");
    setExecuted("");
    addToast("info", "Campos limpos.");
  }

  async function copyText(text: string, okMsg: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      addToast("success", okMsg);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      addToast("success", okMsg);
    }
  }

  // Style helpers
  const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const surfaceBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)";
  const inputBg = isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.03)";

  const platformColors: Record<PlatformKey, string> = {
    linkedin:  "#4B8BFF",
    instagram: "#dc2743",
    whatsapp:  "#25D366",
  };
  const platformActiveBg: Record<PlatformKey, { bg: string; border: string }> = {
    linkedin:  { bg: isDark ? "rgba(75,139,255,0.12)"  : "rgba(75,139,255,0.08)",  border: "rgba(75,139,255,0.35)" },
    instagram: { bg: isDark ? "rgba(220,39,67,0.12)"   : "rgba(220,39,67,0.08)",   border: "rgba(220,39,67,0.35)"  },
    whatsapp:  { bg: isDark ? "rgba(37,211,102,0.10)"  : "rgba(37,211,102,0.07)",  border: "rgba(37,211,102,0.30)" },
  };

  return (
    <Layout toolName="Text Formatter">
      <div
        style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}
      >
        <ToastContainer toasts={toasts} />

        {/* Background: dot grid + ambient glows */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          {/* Dot grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(circle, ${isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.05)"} 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }} />
          <div
            className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full"
            style={{ background: "rgba(75,139,255,0.05)", filter: "blur(130px)" }}
          />
          <div
            className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full"
            style={{ background: "rgba(139,92,246,0.04)", filter: "blur(130px)" }}
          />
        </div>

        {/* ── Platform Tabs + Action buttons ── */}
        <div
          className="sticky top-0 z-40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b backdrop-blur-xl"
          style={{
            background: isDark ? "rgba(10,10,10,0.92)" : "rgba(244,246,249,0.92)",
            borderColor: borderColor,
          }}
        >
          {/* Platform tab pills */}
          <div className="flex items-center gap-1.5">
            {(Object.keys(PLATFORM) as PlatformKey[]).map((key) => {
              const p = PLATFORM[key];
              const active = platform === key;
              return (
                <button
                  key={key}
                  onClick={() => setPlatform(key)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                  style={{
                    background: active ? platformActiveBg[key].bg : "transparent",
                    border: `1px solid ${active ? platformActiveBg[key].border : "transparent"}`,
                    color: active ? platformColors[key] : "var(--muted)",
                  }}
                >
                  {p.icon}
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Platform helper */}
            <span
              className="text-xs hidden lg:block mr-2"
              style={{ color: "var(--muted)", maxWidth: 260 }}
            >
              {PLATFORM[platform].helper}
            </span>

            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border"
              style={{
                background: "transparent",
                borderColor: borderColor,
                color: "var(--text2)",
              }}
            >
              <Eraser size={13} /> CLR
            </button>

            <button
              onClick={onExecute}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: "var(--accent)",
                border: "1px solid var(--accent)",
                color: "#fff",
                boxShadow: "0 2px 14px var(--accent-glow)",
              }}
            >
              <PlayCircle size={14} /> EXECUTAR
            </button>
          </div>
        </div>

        {/* ── Main two-column editor ── */}
        <div
          className="grid grid-cols-1 xl:grid-cols-2"
          style={{ minHeight: "calc(100vh - 120px)" }}
        >
          {/* ── INPUT PANEL ── */}
          <div
            className="flex flex-col"
            style={{ borderRight: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: borderColor }}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}>
                  <FileText size={11} style={{ color: "var(--muted)" }} />
                </div>
                <span
                  className="text-[10px] font-black tracking-widest uppercase"
                  style={{ color: "var(--muted)" }}
                >
                  ENTRADA
                </span>
              </div>
              <span
                className="text-[10px] font-mono"
                style={{ color: "var(--muted)" }}
              >
                {input.length.toLocaleString()} caracteres
              </span>
            </div>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                className="w-full h-full absolute inset-0 px-5 py-4 text-xs font-mono resize-none outline-none"
                style={{
                  background: inputBg,
                  color: "var(--text)",
                  border: "none",
                  minHeight: 380,
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Cole aqui o texto em Markdown ou gerado por IA..."
              />
            </div>

            {/* Syntax tags */}
            <div
              className="flex flex-wrap gap-1.5 px-5 py-3 border-t"
              style={{ borderColor: borderColor, background: surfaceBg }}
            >
              {["# ## ###", "**bold**", "*itálico*", "> quote", "| tabela |"].map((tag) => (
                <span key={tag} className="syntax-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── OUTPUT PANEL ── */}
          <div className="flex flex-col">
            {/* Panel header */}
            <div
              className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b"
              style={{ borderColor: borderColor }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    background: platformActiveBg[platform].bg,
                    border: `1px solid ${platformActiveBg[platform].border}`,
                  }}>
                  <span style={{ color: platformColors[platform], display: "flex" }}>
                    {PLATFORM[platform].icon}
                  </span>
                </div>
                <span
                  className="text-[10px] font-black tracking-widest uppercase"
                  style={{ color: "var(--muted)" }}
                >
                  SAÍDA · {PLATFORM[platform].label}
                </span>
                {/* Status badge */}
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                  style={{
                    borderColor: isStale ? borderColor : "rgba(34,197,94,0.3)",
                    background: isStale ? "transparent" : "rgba(34,197,94,0.08)",
                    color: isStale ? "var(--muted)" : "rgb(34,197,94)",
                  }}
                >
                  {isStale ? "DESATUALIZADA" : "ATUALIZADA"}
                </span>
              </div>

              {/* Copy buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyText(chunks[0] || "", "1º bloco copiado.")}
                  disabled={!executed}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border"
                  style={{
                    background: "transparent",
                    borderColor: borderColor,
                    color: "var(--text2)",
                    opacity: !executed ? 0.4 : 1,
                  }}
                >
                  <Copy size={12} /> Copiar 1º
                </button>
                <button
                  onClick={() => copyText(executed, "Texto completo copiado.")}
                  disabled={!executed}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border"
                  style={{
                    background: "transparent",
                    borderColor: borderColor,
                    color: "var(--text2)",
                    opacity: !executed ? 0.4 : 1,
                  }}
                >
                  <Copy size={12} /> Copiar Tudo
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                className="w-full h-full absolute inset-0 px-5 py-4 text-sm resize-none outline-none font-unicode-safe"
                style={{
                  background: inputBg,
                  color: "var(--text)",
                  border: "none",
                  minHeight: 380,
                }}
                value={outText}
                readOnly
                placeholder={isStale && input ? "Clique em EXECUTAR para ver a saída..." : "Clique em EXECUTAR..."}
              />
            </div>

            {/* Split controls — bottom of output panel */}
            <div
              className="flex items-center gap-3 px-5 py-3 border-t"
              style={{ borderColor: borderColor, background: surfaceBg }}
            >
              <Scissors size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
              <label
                className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
                style={{ color: "var(--muted)" }}
              >
                <input
                  type="checkbox"
                  checked={splitEnabled}
                  onChange={(e) => setSplitEnabled(e.target.checked)}
                  className="accent-purple-500"
                />
                Dividir em
              </label>
              <input
                value={maxLen}
                onChange={(e) => setMaxLen(Number(e.target.value || 0))}
                type="number"
                min={200}
                max={10000}
                disabled={!splitEnabled}
                className="w-20 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold outline-none border transition-opacity"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  borderColor: borderColor,
                  color: "var(--text)",
                  opacity: splitEnabled ? 1 : 0.4,
                }}
              />
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                caracteres
                {chunks.length > 1 && (
                  <span className="ml-2" style={{ color: "var(--accent)" }}>
                    → {chunks.length} blocos
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="text-center text-[10px] font-mono py-6 border-t"
          style={{ borderColor: borderColor, color: "var(--muted)" }}
        >
          © {new Date().getFullYear()} Guebly · Open-source · Sem coleta de dados
        </footer>
      </div>
    </Layout>
  );
}
