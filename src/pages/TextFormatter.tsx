import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  Copy,
  Eraser,
  PlayCircle,
  Linkedin,
  Instagram,
  MessageCircle,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
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
    icon: <Linkedin size={18} />,
    helper: "LinkedIn não aplica markdown. Aqui o destaque é visual (Unicode).",
    maxDefault: 3500,
  },
  instagram: {
    label: "Instagram",
    icon: <Instagram size={18} />,
    helper: "Instagram não aplica markdown. O destaque é visual (Unicode).",
    maxDefault: 2200,
  },
  whatsapp: {
    label: "WhatsApp",
    icon: <MessageCircle size={18} />,
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
    <div className="fixed bottom-24 right-6 z-[9999] flex flex-col gap-2 pointer-events-none w-[92%] md:w-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md",
            t.type === "success"
              ? "bg-green-500/10 border-green-500/50 text-green-400"
              : t.type === "error"
              ? "bg-red-500/10 border-red-500/50 text-red-400"
              : "bg-blue-500/10 border-blue-500/50 text-blue-400",
          ].join(" ")}
        >
          {t.type === "success" ? (
            <CheckCircle size={18} />
          ) : t.type === "error" ? (
            <XCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="text-sm font-bold">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] font-black px-3 py-1.5 rounded-full border tracking-widest transition whitespace-nowrap"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--text2)",
      }}
    >
      {children}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-3 py-1.5 rounded-full text-[10px] font-bold border whitespace-nowrap"
      style={{
        background: "var(--surface2)",
        borderColor: "var(--border2)",
        color: "var(--muted)",
      }}
    >
      {children}
    </span>
  );
}

export default function TextFormatter() {
  const { toasts, addToast } = useToast();
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === 'dark';

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

  return (
    <Layout toolName="Text Formatter">
      <div
        className="min-h-screen overflow-x-hidden"
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        <ToastContainer toasts={toasts} />

        {/* Background glows */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div
            className="absolute top-[-180px] right-[-180px] w-[520px] h-[520px] rounded-full blur-[140px]"
            style={{ background: "rgba(59,130,246,0.06)" }}
          />
          <div
            className="absolute bottom-[-220px] left-[-220px] w-[560px] h-[560px] rounded-full blur-[160px]"
            style={{ background: "rgba(139,92,246,0.05)" }}
          />
        </div>

        <div className="relative z-10">
          {/* Sub-header controls */}
          <header
            className="sticky top-0 z-40 border-b shadow-2xl backdrop-blur-xl"
            style={{
              background: isDark ? "rgba(10,10,10,0.9)" : "rgba(244,246,249,0.9)",
              borderColor: "var(--border)",
            }}
          >
            <div className="px-4 sm:px-6 md:px-10 py-4 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              {/* Left: badges */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="leading-none min-w-0">
                  <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tighter opacity-90 whitespace-nowrap">
                    TEXT<span className="text-blue-500">.FORMATTER</span>
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    <Badge>OPEN-SOURCE</Badge>
                    <Badge>SEM COLETA</Badge>
                    <Badge>SÓ FORMATAÇÃO</Badge>
                  </div>
                </div>
              </div>

              {/* Right: controls */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-start lg:justify-end gap-2 sm:gap-3">
                {/* Platform select */}
                <div
                  className="flex items-center justify-between sm:justify-start gap-2 px-4 py-3 rounded-2xl border w-full sm:w-auto"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                    style={{ color: "var(--muted)" }}
                  >
                    PLATAFORMA
                  </span>

                  <div className="relative flex-1 sm:flex-none min-w-0">
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as PlatformKey)}
                      className="w-full sm:w-auto appearance-none bg-transparent border rounded-xl px-4 py-2 pr-9 text-sm font-black outline-none transition"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text)",
                        background: "var(--surface)",
                      }}
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="instagram">Instagram</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>

                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--muted)" }}
                    >
                      {PLATFORM[platform].icon}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                  <button
                    onClick={onClear}
                    className="w-full px-4 sm:px-5 py-3 rounded-2xl font-black text-[11px] sm:text-xs tracking-widest transition active:scale-95 flex items-center justify-center gap-2 border"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--text2)",
                    }}
                  >
                    <Eraser size={16} /> <span className="truncate">LIMPAR</span>
                  </button>

                  <button
                    onClick={onExecute}
                    className="w-full relative px-4 sm:px-5 py-3 rounded-2xl font-black text-[11px] sm:text-xs tracking-widest flex items-center justify-center gap-2 border transition active:scale-95 hover:-translate-y-[1px] select-none overflow-hidden"
                    style={{
                      background: "var(--accent)",
                      borderColor: "var(--accent)",
                      color: "#fff",
                      boxShadow: "0 4px 18px var(--accent-glow)",
                    }}
                  >
                    <span className="relative flex items-center gap-2">
                      <PlayCircle size={16} />
                      <span className="truncate">EXECUTAR</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 md:p-12 max-w-[1920px] mx-auto space-y-6 md:space-y-8">
            <section
              className="border rounded-[26px] md:rounded-[30px] p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="absolute top-0 left-0 w-full h-1 opacity-50"
                style={{
                  background: "linear-gradient(90deg, rgb(37,99,235), rgb(147,51,234), rgb(37,99,235))",
                }}
              />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black flex items-center gap-3">
                    {PLATFORM[platform].icon} Central de Formatação
                  </h2>
                  <p
                    className="text-xs md:text-sm mt-1"
                    style={{ color: "var(--text2)" }}
                  >
                    Cole o texto (Markdown/IA) e transforme para o que o app
                    realmente aceita. {PLATFORM[platform].helper}
                  </p>
                </div>

                <div
                  className="w-full md:w-auto flex items-center justify-between md:justify-start gap-3 px-4 py-3 rounded-2xl border"
                  style={{
                    background: "var(--surface2)",
                    borderColor: "var(--border)",
                  }}
                  title="DIVIDIR: quebra a saída em blocos com no máximo X caracteres."
                >
                  <label
                    className="flex items-center gap-2 text-xs font-black whitespace-nowrap"
                    style={{ color: "var(--muted)" }}
                  >
                    <input
                      type="checkbox"
                      checked={splitEnabled}
                      onChange={(e) => setSplitEnabled(e.target.checked)}
                      className="accent-purple-500"
                    />
                    DIVIDIR
                  </label>

                  <input
                    value={maxLen}
                    onChange={(e) => setMaxLen(Number(e.target.value || 0))}
                    type="number"
                    min={200}
                    max={10000}
                    className="w-24 sm:w-28 rounded-xl px-3 py-2 text-sm font-black outline-none transition border"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    disabled={!splitEnabled}
                  />

                  <span
                    className="hidden sm:inline text-[10px] font-bold whitespace-nowrap"
                    style={{ color: "var(--muted)" }}
                  >
                    quebra em partes
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Input */}
                <div
                  className="border p-4 sm:p-6 rounded-2xl shadow-lg"
                  style={{
                    background: "var(--surface2)",
                    borderColor: "var(--border2)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm tracking-wide uppercase">Entrada</h3>
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: "var(--muted)" }}
                    >
                      {input.length.toLocaleString()} chars
                    </span>
                  </div>

                  <textarea
                    className="w-full min-h-[360px] sm:min-h-[420px] rounded-xl px-4 py-4 text-xs font-mono outline-none transition resize-y border"
                    style={{
                      background: "var(--bg2)",
                      borderColor: "var(--border2)",
                      color: "var(--text)",
                    }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Cole aqui..."
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Tag># ## ###</Tag>
                    <Tag>**negrito**</Tag>
                    <Tag>*itálico*</Tag>
                    <Tag>&gt; blockquote</Tag>
                    <Tag>| tabela |</Tag>
                  </div>
                </div>

                {/* Output */}
                <div
                  className="border p-4 sm:p-6 rounded-2xl shadow-lg"
                  style={{
                    background: "var(--surface2)",
                    borderColor: "var(--border2)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2 min-w-0">
                      <span className="truncate">
                        Saída • {PLATFORM[platform].label}
                      </span>
                      <span
                        className="text-[10px] font-black px-2 py-1 rounded border shrink-0"
                        style={{
                          borderColor: isStale
                            ? "var(--border)"
                            : "rgba(34,197,94,0.30)",
                          background: isStale
                            ? "var(--surface)"
                            : "rgba(34,197,94,0.10)",
                          color: isStale ? "var(--muted)" : "rgb(34,197,94)",
                        }}
                      >
                        {isStale ? "PRECISA EXECUTAR" : "ATUALIZADA"}
                      </span>
                    </h3>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => copyText(chunks[0] || "", "Copiado (1º bloco).")}
                        className="w-full sm:w-auto px-3 py-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-2 border"
                        style={{
                          background: "var(--surface)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        disabled={!executed}
                      >
                        <Copy size={14} /> <span className="truncate">1º</span>
                      </button>

                      <button
                        onClick={() => copyText(executed, "Copiado (inteiro).")}
                        className="w-full sm:w-auto px-3 py-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-2 border"
                        style={{
                          background: "var(--surface)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        disabled={!executed}
                      >
                        <Copy size={14} /> <span className="truncate">INTEIRO</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    className="w-full min-h-[360px] sm:min-h-[420px] rounded-xl px-4 py-4 text-sm outline-none transition resize-y border font-unicode-safe"
                    style={{
                      background: "var(--bg2)",
                      borderColor: "var(--border2)",
                      color: "var(--text)",
                    }}
                    value={outText}
                    readOnly
                    placeholder="Clique em EXECUTAR..."
                  />

                  <div
                    className="mt-4 flex items-start gap-3 text-[11px]"
                    style={{ color: "var(--muted)" }}
                  >
                    <div className="mt-0.5">
                      <Info size={14} />
                    </div>
                    <p className="leading-relaxed">
                      Se você ver "□", é falta de glyph Unicode na fonte do
                      sistema. A saída aqui usa uma stack de fontes mais segura.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <footer
              className="text-center text-[10px] font-mono py-8"
              style={{ color: "var(--muted)" }}
            >
              © {new Date().getFullYear()} Guebly • Open-source tool • Sem coleta de dados
            </footer>
          </main>
        </div>
      </div>
    </Layout>
  );
}
