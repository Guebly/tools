import { useState, useRef, useCallback, useEffect, Fragment } from "react";
import Layout from "../components/Layout";
import { useTheme } from "../contexts/ThemeContext";
import {
  Mic, Video, Music, Play, Pause, X, Download, Copy, Check,
  RefreshCw, Clock, Lock, Zap, Gift, Smartphone, Monitor,
  ChevronRight, FileText, Subtitles, Globe, AlertTriangle,
} from "lucide-react";

const fmtDur = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const fmtSize = (b: number) =>
  b < 1_048_576
    ? (b / 1024).toFixed(1) + " KB"
    : (b / 1_048_576).toFixed(1) + " MB";
const wc = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
const isVideo = (f?: File | null) =>
  f?.type?.startsWith("video/") ||
  /\.(mp4|mov|avi|mkv)$/i.test(f?.name || "");
const fmtSRT = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.round((s % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
};

const LANGS = [
  { v: "pt", l: "🇧🇷 Português" },
  { v: "en", l: "🇺🇸 English" },
  { v: "es", l: "🇪🇸 Español" },
  { v: "auto", l: "Auto" },
];

const MODELS = [
  { v: "onnx-community/whisper-tiny",  l: "Tiny",  sub: "~40 MB · rápido" },
  { v: "onnx-community/whisper-base",  l: "Base",  sub: "~150 MB · preciso" },
];

let _id = 0;
const mkId = () => ++_id;

interface QueueItem {
  id: number;
  file: File;
  url: string;
  duration: number;
  status: "idle" | "loading" | "transcribing" | "done" | "error";
  progress: number;
  elapsed: number;
  transcript: string;
  chunks: Array<{ text: string; timestamp?: [number, number | null] }>;
  error: string | null;
  statusMsg: string;
  sizeWarning: string | null;
}

export default function ZapTranscriber() {
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === "dark";

  const c = {
    bg:          isDark ? "#080b09" : "#f4f6f9",
    dot:         isDark ? "rgba(37,211,102,0.032)" : "rgba(22,163,74,0.048)",
    surface:     isDark ? "#0f1512" : "#ffffff",
    surface2:    isDark ? "#182019" : "#f1f5f0",
    border:      isDark ? "rgba(37,211,102,0.10)" : "rgba(0,0,0,0.08)",
    borderHard:  isDark ? "rgba(37,211,102,0.18)" : "rgba(0,0,0,0.13)",
    text:        isDark ? "#e6f0ea" : "#0f172a",
    text2:       isDark ? "#7a9e8a" : "#475569",
    text3:       isDark ? "#3d5447" : "#94a3b8",
    accent:      isDark ? "#25D366" : "#16a34a",
    accentSoft:  isDark ? "rgba(37,211,102,0.08)" : "rgba(22,163,74,0.07)",
    accentGlow:  isDark ? "rgba(37,211,102,0.14)" : "rgba(22,163,74,0.12)",
    errBg:       isDark ? "#1a0e0e" : "#fef2f2",
    errBd:       isDark ? "#331a1a" : "#fecaca",
    warnColor:   isDark ? "#f59e0b" : "#d97706",
    shadow:      isDark ? "0 2px 16px rgba(0,0,0,0.45)" : "0 2px 16px rgba(0,0,0,0.07)",
    shadowMd:    isDark ? "0 4px 32px rgba(0,0,0,0.55)" : "0 4px 32px rgba(0,0,0,0.10)",
  };

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lang, setLang] = useState("pt");
  const [model, setModel] = useState("onnx-community/whisper-base");
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [playingIds, setPlayingIds] = useState<Record<number, boolean>>({});
  const [curTimes, setCurTimes] = useState<Record<number, number>>({});

  const fileRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const processingIdRef = useRef<number | null>(null);
  const audioRefsMap = useRef<Record<number, HTMLAudioElement>>({});
  const langRef = useRef(lang);
  const modelRef = useRef(model);
  const queueRef = useRef<QueueItem[]>([]);

  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { modelRef.current = model; }, [model]);
  useEffect(() => { queueRef.current = queue; }, [queue]);

  // ── Decode audio/video file → mono Float32Array at 16 kHz ──
  const decodeFile = useCallback(async (item: QueueItem, onFallback?: () => void) => {
    const TARGET_SR = 16000;
    const toMono = (buf: AudioBuffer) => {
      if (buf.numberOfChannels === 1) return buf.getChannelData(0).slice();
      const a = buf.getChannelData(0);
      const b = buf.getChannelData(1);
      const out = new Float32Array(a.length);
      for (let i = 0; i < a.length; i++) out[i] = (a[i] + b[i]) / 2;
      return out;
    };
    const resample = async (decoded: AudioBuffer) => {
      if (decoded.sampleRate === TARGET_SR) return toMono(decoded);
      const len = Math.ceil(decoded.duration * TARGET_SR);
      const off = new OfflineAudioContext(1, len, TARGET_SR);
      const src = off.createBufferSource();
      src.buffer = decoded;
      src.connect(off.destination);
      src.start(0);
      const rendered = await off.startRendering();
      return rendered.getChannelData(0).slice();
    };
    try {
      const arrayBuf = await item.file.arrayBuffer();
      if (arrayBuf.byteLength === 0) throw new Error("empty");
      const ctx = new AudioContext();
      let decoded: AudioBuffer;
      try { decoded = await ctx.decodeAudioData(arrayBuf); }
      finally { ctx.close(); }
      const samples = await resample(decoded!);
      return { samples, duration: decoded!.duration };
    } catch (_) {}
    onFallback?.();
    return new Promise<{ samples: Float32Array; duration: number }>((resolve, reject) => {
      let done = false;
      const finish = (fn: () => void) => { if (!done) { done = true; fn(); } };
      const el = document.createElement(isVideo(item.file) ? "video" : "audio") as HTMLMediaElement;
      el.src = item.url;
      el.preload = "auto";
      el.muted = true;
      el.style.display = "none";
      document.body.appendChild(el);
      const cleanup = (ctx: AudioContext | null) => {
        try { document.body.removeChild(el); } catch (_) {}
        ctx?.close();
      };
      el.addEventListener("error", () => {
        const code = (el as HTMLMediaElement & { error?: { code?: number } }).error?.code ?? "?";
        finish(() => {
          cleanup(null);
          reject(new Error(`Erro de mídia (código ${code}). Salve o arquivo no computador e tente novamente, ou converta para MP4/MP3.`));
        });
      });
      el.addEventListener("loadedmetadata", async () => {
        const duration = (el as HTMLMediaElement & { duration: number }).duration;
        const ctx = new AudioContext();
        await ctx.resume();
        const nativeSR = ctx.sampleRate;
        const source = ctx.createMediaElementSource(el);
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        const silencer = ctx.createGain();
        silencer.gain.value = 0;
        const collected: Float32Array[] = [];
        processor.onaudioprocess = (e) => { collected.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
        source.connect(processor);
        processor.connect(silencer);
        silencer.connect(ctx.destination);
        el.addEventListener("ended", async () => {
          finish(async () => {
            processor.disconnect();
            silencer.disconnect();
            cleanup(ctx);
            const total = collected.reduce((s, ch) => s + ch.length, 0);
            const raw = new Float32Array(total);
            let off = 0;
            for (const chunk of collected) { raw.set(chunk, off); off += chunk.length; }
            let samples: Float32Array;
            if (nativeSR === TARGET_SR) {
              samples = raw;
            } else {
              const targetLen = Math.ceil(duration * TARGET_SR);
              const offCtx = new OfflineAudioContext(1, targetLen, TARGET_SR);
              const buf = offCtx.createBuffer(1, raw.length, nativeSR);
              buf.copyToChannel(raw, 0);
              const bufSrc = offCtx.createBufferSource();
              bufSrc.buffer = buf;
              bufSrc.connect(offCtx.destination);
              bufSrc.start(0);
              const rendered = await offCtx.startRendering();
              samples = rendered.getChannelData(0).slice();
            }
            resolve({ samples, duration });
          });
        });
        el.play().catch(() => {
          finish(() => { cleanup(ctx); reject(new Error("Reprodução bloqueada pelo navegador. Tente novamente.")); });
        });
      });
    });
  }, []);

  const startNext = useCallback(async (currentQueue: QueueItem[]) => {
    const next = currentQueue.find((i) => i.status === "idle");
    if (!next) { processingIdRef.current = null; setIsProcessing(false); return; }
    const id = next.id;
    processingIdRef.current = id;
    setIsProcessing(true);
    let audio: Float32Array, duration: number;
    try {
      const result = await decodeFile(next, () => {
        setQueue((q) => q.map((item) => item.id === id ? { ...item, status: "loading", statusMsg: "Extraindo áudio do vídeo…" } : item));
      });
      audio = result.samples;
      duration = result.duration;
    } catch (err: any) {
      setQueue((q) => {
        const updated = q.map((item) => item.id === id ? { ...item, status: "error" as const, error: "Erro ao decodificar: " + err.message } : item);
        setTimeout(() => startNext(updated), 0);
        return updated;
      });
      processingIdRef.current = null;
      setIsProcessing(false);
      return;
    }
    if (processingIdRef.current !== id) return;
    const opts: Record<string, any> = { chunk_length_s: 28, stride_length_s: 6, return_timestamps: true, no_repeat_ngram_size: 3 };
    if (langRef.current !== "auto") opts.language = langRef.current;
    workerRef.current?.postMessage({ type: "transcribe", payload: { audio, opts, model: modelRef.current, duration } }, [audio.buffer]);
  }, [decodeFile]);

  const handleWorkerMessage = useCallback(({ data }: MessageEvent) => {
    const { type, payload } = data;
    const id = processingIdRef.current;
    if (!id) return;
    if (type === "cached") {
      setQueue((q) => q.map((item) => item.id === id ? { ...item, status: "loading" as const, progress: 100, statusMsg: "Modelo em cache ✓" } : item));
    } else if (type === "loading") {
      setQueue((q) => q.map((item) => item.id === id ? { ...item, status: "loading" as const, progress: 0, statusMsg: "Baixando modelo…" } : item));
    } else if (type === "download_progress") {
      setQueue((q) => q.map((item) => item.id === id ? { ...item, progress: payload, statusMsg: `Baixando modelo… ${payload}%` } : item));
    } else if (type === "transcribing") {
      setQueue((q) => q.map((item) => item.id === id ? { ...item, status: "transcribing" as const, progress: 0, statusMsg: isVideo(item.file) ? "Transcrevendo vídeo…" : "Transcrevendo áudio…" } : item));
    } else if (type === "trans_progress") {
      setQueue((q) => q.map((item) => item.id === id ? { ...item, progress: payload } : item));
    } else if (type === "result") {
      const text = payload.text?.trim() || payload.chunks?.map((ch: any) => ch.text).join(" ").trim() || "";
      const chunks = payload.chunks || [];
      setQueue((q) => {
        const updated = q.map((item) => item.id === id ? { ...item, status: "done" as const, transcript: text, chunks, progress: 100 } : item);
        setTimeout(() => startNext(updated), 0);
        return updated;
      });
    } else if (type === "error") {
      setQueue((q) => {
        const updated = q.map((item) => item.id === id ? { ...item, status: "error" as const, error: payload } : item);
        setTimeout(() => startNext(updated), 0);
        return updated;
      });
    }
  }, [startNext]);

  const initWorker = useCallback(() => {
    workerRef.current?.terminate();
    const worker = new Worker(new URL("../workers/whisper.worker.js", import.meta.url), { type: "module" });
    worker.onmessage = handleWorkerMessage;
    workerRef.current = worker;
  }, [handleWorkerMessage]);

  useEffect(() => { initWorker(); return () => workerRef.current?.terminate(); }, [initWorker]);

  const cancelTranscription = useCallback(() => {
    const id = processingIdRef.current;
    if (!id) return;
    processingIdRef.current = null;
    setIsProcessing(false);
    initWorker();
    setQueue((q) => q.map((item) => item.id === id ? { ...item, status: "idle" as const, progress: 0, elapsed: 0, statusMsg: "" } : item));
  }, [initWorker]);

  useEffect(() => {
    if (!isProcessing) return;
    const timer = setInterval(() => {
      if (processingIdRef.current) {
        setQueue((q) => q.map((item) => item.id === processingIdRef.current ? { ...item, elapsed: (item.elapsed || 0) + 1 } : item));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isProcessing]);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return;
    const newItems: QueueItem[] = Array.from(fileList).map((f) => {
      const url = URL.createObjectURL(f);
      const id = mkId();
      const sizeWarning =
        f.size === 0
          ? "Arquivo sem conteúdo (0 bytes). Baixe o arquivo para o seu computador antes de arrastar."
          : (isVideo(f) && f.size > 1_073_741_824) || (!isVideo(f) && f.size > 209_715_200)
          ? `Arquivo grande (${fmtSize(f.size)}) — pode ser lento ou falhar.`
          : null;
      const item: QueueItem = { id, file: f, url, duration: 0, status: "idle", progress: 0, elapsed: 0, transcript: "", chunks: [], error: null, statusMsg: "", sizeWarning };
      const a = new Audio(url);
      a.addEventListener("loadedmetadata", () => { setQueue((q) => q.map((i) => (i.id === id ? { ...i, duration: a.duration } : i))); });
      return item;
    });
    setQueue((q) => [...q, ...newItems]);
  }, []);

  const removeItem = useCallback((id: number) => {
    if (processingIdRef.current === id) return;
    setQueue((q) => { const item = q.find((i) => i.id === id); if (item) URL.revokeObjectURL(item.url); return q.filter((i) => i.id !== id); });
    setPlayingIds((p) => { const n = { ...p }; delete n[id]; return n; });
    setCurTimes((ct) => { const n = { ...ct }; delete n[id]; return n; });
    delete audioRefsMap.current[id];
  }, []);

  const startAll = useCallback(() => { setQueue((q) => { setTimeout(() => startNext(q), 0); return q; }); }, [startNext]);

  const retryItem = useCallback((id: number) => {
    setQueue((q) => {
      const updated = q.map((i) => i.id === id ? { ...i, status: "idle" as const, error: null, progress: 0, elapsed: 0 } : i);
      setTimeout(() => startNext(updated), 0);
      return updated;
    });
  }, [startNext]);

  const togglePlay = useCallback((id: number) => {
    const el = audioRefsMap.current[id];
    if (!el) return;
    if (el.paused) { el.play(); setPlayingIds((p) => ({ ...p, [id]: true })); }
    else { el.pause(); setPlayingIds((p) => ({ ...p, [id]: false })); }
  }, []);

  const seek = useCallback((id: number, e: React.MouseEvent) => {
    const el = audioRefsMap.current[id];
    const item = queueRef.current.find((i) => i.id === id);
    if (!el || !item?.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * item.duration;
  }, []);

  const copyTranscript = useCallback((id: number) => {
    const item = queueRef.current.find((i) => i.id === id);
    if (!item) return;
    navigator.clipboard.writeText(item.transcript);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const downloadTxt = useCallback((id: number) => {
    const item = queueRef.current.find((i) => i.id === id);
    if (!item) return;
    const blob = new Blob([item.transcript], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (item.file.name.replace(/\.[^.]+$/, "") || "transcricao") + ".txt";
    a.click();
  }, []);

  const downloadSrt = useCallback((id: number) => {
    const item = queueRef.current.find((i) => i.id === id);
    if (!item?.chunks?.length) return;
    const lines = item.chunks.filter((ch) => ch.timestamp?.[0] != null).map((ch, i) => {
      const start = fmtSRT(ch.timestamp![0]);
      const end = fmtSRT(Math.max(ch.timestamp![0] + 0.5, ch.timestamp![1] ?? ch.timestamp![0] + 3));
      return `${i + 1}\n${start} --> ${end}\n${ch.text.trim()}\n`;
    }).join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (item.file.name.replace(/\.[^.]+$/, "") || "legenda") + ".srt";
    a.click();
  }, []);

  const idleItems = queue.filter((i) => i.status === "idle");
  const hasIdle = idleItems.length > 0;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <Layout toolName="ZapTranscriber">
      <div style={{ minHeight: "100vh", background: c.bg, color: c.text }}>

        {/* Background: dot grid + ambient blobs */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: -1, overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(circle, ${c.dot} 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }} />
          <div style={{ position: "absolute", top: -200, right: -200, width: 520, height: 520, borderRadius: "50%", background: isDark ? "rgba(37,211,102,0.04)" : "rgba(22,163,74,0.05)", filter: "blur(130px)" }} />
          <div style={{ position: "absolute", bottom: -200, left: -200, width: 420, height: 420, borderRadius: "50%", background: isDark ? "rgba(75,139,255,0.025)" : "rgba(37,99,235,0.03)", filter: "blur(110px)" }} />
        </div>

        {/* ═══ HERO ═══ */}
        <div style={{ position: "relative", overflow: "hidden", paddingTop: "3.5rem", paddingBottom: "2.5rem", textAlign: "center" }}>
          {/* Glow */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${c.accentGlow} 0%, transparent 70%)` }} />

          {/* Icon */}
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 72, height: 72, borderRadius: 22, marginBottom: 24, position: "relative",
            background: c.accentSoft, border: `1.5px solid ${c.accent}35`,
            boxShadow: `0 0 40px ${c.accentGlow}, 0 8px 24px rgba(0,0,0,0.2)`,
          }}>
            <Mic size={32} color={c.accent} strokeWidth={1.8} />
          </div>

          <h1 style={{ fontSize: "clamp(1.9rem, 5vw, 2.9rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.08, maxWidth: 700, margin: "0 auto 14px" }}>
            Transcreva áudios e vídeos
            <br />
            <span style={{ color: c.accent }}>direto no navegador</span>
          </h1>

          <p style={{ color: c.text2, fontSize: "0.95rem", lineHeight: 1.65, maxWidth: 520, margin: "0 auto 24px" }}>
            IA Whisper rodando 100% local. Nenhum dado sai do seu dispositivo.
            Suporta múltiplos arquivos e gera legendas .srt.
          </p>

          {/* Feature stats bar */}
          <div style={{
            display: "inline-flex", alignItems: "center", borderRadius: 20, overflow: "hidden",
            border: `1px solid ${isDark ? "rgba(37,211,102,0.18)" : "rgba(22,163,74,0.15)"}`,
            background: isDark ? "rgba(37,211,102,0.05)" : "rgba(22,163,74,0.04)",
          }}>
            {[
              { icon: <Lock size={11} />, label: "100% privado" },
              { icon: <Zap size={11} />, label: "Sem servidor" },
              { icon: <Globe size={11} />, label: "Multi-idioma" },
              { icon: <Gift size={11} />, label: "Open source" },
            ].map(({ icon, label }, i) => (
              <Fragment key={label}>
                {i > 0 && <div style={{ width: 1, alignSelf: "stretch", background: isDark ? "rgba(37,211,102,0.18)" : "rgba(22,163,74,0.15)" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px" }}>
                  <span style={{ color: c.accent }}>{icon}</span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: isDark ? "rgba(37,211,102,0.8)" : "rgba(22,163,74,0.9)", whiteSpace: "nowrap" }}>{label}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 16px 48px" }}>

          {/* ── SETTINGS ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20,
          }}>
            {/* Language */}
            <div style={{
              background: c.surface, border: `1.5px solid ${c.border}`,
              borderRadius: 16, padding: "14px 16px", boxShadow: c.shadow,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Globe size={13} color={c.text2} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: c.text2 }}>
                  Idioma
                </span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {LANGS.map(({ v, l }) => (
                  <button key={v} onClick={() => setLang(v)} disabled={isProcessing}
                    style={{
                      padding: "5px 11px", borderRadius: 8, fontSize: "0.76rem", fontWeight: lang === v ? 700 : 500,
                      cursor: isProcessing ? "default" : "pointer", fontFamily: "inherit",
                      transition: "all 0.15s", border: `1.5px solid ${lang === v ? c.accent : c.border}`,
                      background: lang === v ? c.accentSoft : "transparent",
                      color: lang === v ? c.accent : c.text2,
                      opacity: isProcessing ? 0.5 : 1,
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Model */}
            <div style={{
              background: c.surface, border: `1.5px solid ${c.border}`,
              borderRadius: 16, padding: "14px 16px", boxShadow: c.shadow,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Zap size={13} color={c.text2} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: c.text2 }}>
                  Modelo Whisper
                </span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {MODELS.map(({ v, l, sub }) => (
                  <button key={v} onClick={() => setModel(v)} disabled={isProcessing}
                    title={sub}
                    style={{
                      padding: "5px 11px", borderRadius: 8, fontSize: "0.76rem", fontWeight: model === v ? 700 : 500,
                      cursor: isProcessing ? "default" : "pointer", fontFamily: "inherit",
                      transition: "all 0.15s", border: `1.5px solid ${model === v ? c.accent : c.border}`,
                      background: model === v ? c.accentSoft : "transparent",
                      color: model === v ? c.accent : c.text2,
                      opacity: isProcessing ? 0.5 : 1,
                    }}>
                    {l}
                    <span style={{ fontSize: "0.65rem", opacity: 0.7, marginLeft: 4 }}>{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── DROPZONE ── */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            style={{
              border: `2px dashed ${dragOver ? c.accent : c.borderHard}`,
              borderRadius: queue.length > 0 ? 14 : 24,
              padding: queue.length > 0 ? "14px 20px" : "52px 32px",
              textAlign: "center", cursor: "pointer",
              background: dragOver ? c.accentSoft : queue.length > 0 ? "transparent" : c.surface,
              transition: "all 0.2s ease",
              boxShadow: queue.length > 0 ? "none" : dragOver ? `0 0 0 4px ${c.accentGlow}` : c.shadow,
              marginBottom: 16,
            }}
          >
            {queue.length === 0 ? (
              <>
                {/* Large icon */}
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 80, height: 80, borderRadius: 24, marginBottom: 20,
                  background: dragOver ? c.accentSoft : c.accentSoft,
                  border: `1.5px solid ${c.accent}35`,
                  boxShadow: dragOver ? `0 0 28px ${c.accentGlow}` : "none",
                  transition: "all 0.2s",
                }}>
                  {dragOver
                    ? <Download size={36} color={c.accent} strokeWidth={1.6} />
                    : <Mic size={36} color={c.accent} strokeWidth={1.6} />
                  }
                </div>

                <p style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: 8, letterSpacing: "-0.03em" }}>
                  {dragOver ? "Solte aqui" : "Arraste o áudio ou vídeo"}
                </p>
                <p style={{ color: c.text2, fontSize: "0.87rem", marginBottom: 22, lineHeight: 1.5 }}>
                  ou clique para selecionar — múltiplos arquivos suportados
                </p>

                {/* Format badges */}
                <div style={{ display: "inline-flex", gap: 5, flexWrap: "wrap", justifyContent: "center", maxWidth: 480 }}>
                  {[".ogg",".opus",".mp3",".m4a",".wav",".webm",".mp4",".mov",".avi",".mkv"].map((ext) => (
                    <span key={ext} style={{
                      background: c.accentSoft, color: c.accent,
                      fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px",
                      borderRadius: 6, letterSpacing: "0.02em",
                      border: `1px solid ${c.accent}25`,
                    }}>
                      {ext}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: c.text2, fontSize: "0.83rem", fontWeight: 600 }}>
                <Download size={14} color={c.text2} />
                {dragOver ? "Soltar aqui" : "+ Adicionar mais arquivos"}
              </div>
            )}
            <input ref={fileRef} type="file" accept="audio/*,video/*,.ogg,.opus,.mp3,.m4a,.wav,.webm,.mp4,.mov,.avi,.mkv"
              multiple style={{ display: "none" }}
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </div>

          {/* ── QUEUE ── */}
          {queue.map((item) => {
            const itemBusy = item.status === "loading" || item.status === "transcribing";
            const playPct = item.duration > 0 ? ((curTimes[item.id] || 0) / item.duration) * 100 : 0;
            const isPlaying = !!playingIds[item.id];
            const isCurrentlyProcessing = processingIdRef.current === item.id;
            const hasSrt = item.chunks?.some((ch) => ch.timestamp?.[0] != null);

            const statusColor = item.status === "done" ? c.accent : item.status === "error" ? "#ef4444" : c.text3;
            const statusLabel = item.status === "idle" ? "Aguardando"
              : item.status === "done" ? `Concluído · ${item.elapsed}s`
              : item.status === "error" ? "Erro"
              : `${item.statusMsg || "Processando…"} ${item.status === "transcribing" ? `· ${item.elapsed}s` : ""}`;

            return (
              <div key={item.id} style={{
                marginBottom: 14,
                background: c.surface,
                border: `1.5px solid ${item.status === "done" ? c.accent + "35" : item.status === "error" ? c.errBd : c.border}`,
                borderRadius: 20, overflow: "hidden", boxShadow: c.shadow,
                transition: "border-color 0.3s",
              }}>
                {/* Progress bar at top (when processing) */}
                {itemBusy && (
                  <div style={{ height: 3, background: c.surface2 }}>
                    <div style={{
                      height: "100%",
                      width: item.status === "transcribing" && item.progress === 0 ? "100%" : `${item.progress}%`,
                      background: `linear-gradient(90deg, ${c.accent}aa, ${c.accent})`,
                      transition: item.progress > 0 ? "width 0.5s ease" : "none",
                      animation: item.status === "transcribing" && item.progress === 0 ? "pulse 1.5s infinite" : "none",
                      boxShadow: `0 0 10px ${c.accentGlow}`,
                    }} />
                  </div>
                )}

                {/* File info row */}
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Icon */}
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                    background: c.accentSoft, border: `1.5px solid ${c.accent}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isVideo(item.file)
                      ? <Video size={20} color={c.accent} strokeWidth={1.8} />
                      : <Music size={20} color={c.accent} strokeWidth={1.8} />
                    }
                  </div>

                  {/* File details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.file.name}
                    </div>
                    <div style={{ color: c.text2, fontSize: "0.73rem", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{fmtSize(item.file.size)}</span>
                      {item.duration > 0 && (
                        <>
                          <span style={{ color: c.text3 }}>·</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={10} color={c.text3} />{fmtDur(item.duration)}
                          </span>
                        </>
                      )}
                      <span style={{ color: statusColor, fontWeight: 600, fontSize: "0.7rem" }}>
                        {statusLabel}
                      </span>
                    </div>
                    {item.sizeWarning && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: c.warnColor, fontSize: "0.7rem", marginTop: 3 }}>
                        <AlertTriangle size={11} />{item.sizeWarning}
                      </div>
                    )}
                  </div>

                  {/* Play/pause */}
                  <button onClick={() => togglePlay(item.id)} style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isPlaying ? c.accent : "transparent",
                    border: `1.5px solid ${isPlaying ? c.accent : c.border}`,
                    color: isPlaying ? "#fff" : c.text,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                  </button>

                  {/* Cancel or Remove */}
                  {isCurrentlyProcessing ? (
                    <button onClick={cancelTranscription} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: "transparent", border: `1.5px solid ${c.border}`,
                      color: "#ef4444", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700,
                      padding: "5px 11px", borderRadius: 8, fontFamily: "inherit",
                      flexShrink: 0, transition: "all 0.15s",
                    }}>
                      <X size={12} />Cancelar
                    </button>
                  ) : (
                    <button onClick={() => removeItem(item.id)} style={{
                      width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "none", border: "none", color: c.text3, cursor: "pointer",
                      borderRadius: 8, transition: "color 0.15s", flexShrink: 0,
                    }}>
                      <X size={15} />
                    </button>
                  )}

                  <audio
                    ref={(el) => { if (el) audioRefsMap.current[item.id] = el; }}
                    src={item.url}
                    onEnded={() => setPlayingIds((p) => ({ ...p, [item.id]: false }))}
                    onTimeUpdate={(e) => setCurTimes((ct) => ({ ...ct, [item.id]: (e.target as HTMLAudioElement).currentTime }))}
                  />
                </div>

                {/* Seek bar */}
                <div style={{ padding: "0 16px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "0.67rem", color: c.text3, fontVariantNumeric: "tabular-nums", minWidth: 30, textAlign: "right" }}>
                    {fmtDur(curTimes[item.id] || 0)}
                  </span>
                  <div onClick={(e) => seek(item.id, e)} style={{
                    flex: 1, height: 6, background: c.surface2, borderRadius: 3, cursor: "pointer", overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", background: c.accent, borderRadius: 3,
                      width: `${playPct}%`, transition: "width 0.15s",
                    }} />
                  </div>
                  <span style={{ fontSize: "0.67rem", color: c.text3, fontVariantNumeric: "tabular-nums", minWidth: 30 }}>
                    {fmtDur(item.duration)}
                  </span>
                </div>

                <div style={{ height: 1, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }} />

                {/* Error state */}
                {item.status === "error" && (
                  <div style={{
                    padding: "12px 16px", background: c.errBg, borderTop: `1px solid ${c.errBd}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1, minWidth: 0 }}>
                      <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: "0.8rem", color: "#ef4444", wordBreak: "break-word" }}>{item.error}</span>
                    </div>
                    <button onClick={() => retryItem(item.id)} disabled={isProcessing} style={{
                      display: "flex", alignItems: "center", gap: 5, background: "transparent",
                      border: "1.5px solid #ef4444", color: "#ef4444", borderRadius: 8,
                      padding: "5px 12px", fontSize: "0.73rem", fontWeight: 600,
                      cursor: isProcessing ? "default" : "pointer", fontFamily: "inherit",
                      flexShrink: 0, opacity: isProcessing ? 0.5 : 1,
                    }}>
                      <RefreshCw size={11} />Tentar novamente
                    </button>
                  </div>
                )}

                {/* Result */}
                {item.status === "done" && item.transcript && (
                  <div>
                    {/* Actions bar */}
                    <div style={{
                      padding: "10px 16px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      flexWrap: "wrap", gap: 8,
                    }}>
                      <button onClick={() => setShowTimestamps((s) => !s)} style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: showTimestamps ? c.accentSoft : "transparent",
                        border: `1.5px solid ${showTimestamps ? c.accent : c.border}`,
                        color: showTimestamps ? c.accent : c.text2,
                        padding: "5px 12px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      }}>
                        <Clock size={12} />Timestamps
                      </button>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => copyTranscript(item.id)} style={{
                          display: "flex", alignItems: "center", gap: 5,
                          background: copiedId === item.id ? c.accentSoft : "transparent",
                          border: `1.5px solid ${copiedId === item.id ? c.accent : c.border}`,
                          color: copiedId === item.id ? c.accent : c.text2,
                          padding: "5px 12px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600,
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                        }}>
                          {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                          {copiedId === item.id ? "Copiado" : "Copiar"}
                        </button>
                        <button onClick={() => downloadTxt(item.id)} style={{
                          display: "flex", alignItems: "center", gap: 5,
                          background: "transparent", border: `1.5px solid ${c.border}`,
                          color: c.text2, padding: "5px 12px", borderRadius: 8,
                          fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                          fontFamily: "inherit", transition: "all 0.15s",
                        }}>
                          <FileText size={12} />.txt
                        </button>
                        {hasSrt && (
                          <button onClick={() => downloadSrt(item.id)} style={{
                            display: "flex", alignItems: "center", gap: 5,
                            background: "transparent", border: `1.5px solid ${c.border}`,
                            color: c.text2, padding: "5px 12px", borderRadius: 8,
                            fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                            fontFamily: "inherit", transition: "all 0.15s",
                          }}>
                            <Subtitles size={12} />.srt
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Transcript */}
                    <div style={{
                      padding: "16px", fontSize: "0.9rem", lineHeight: 1.8,
                      maxHeight: 380, overflowY: "auto", whiteSpace: "pre-wrap",
                      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}`,
                    }}>
                      {showTimestamps && item.chunks?.length > 0
                        ? item.chunks.map((ch, i) => (
                            <span key={i}>
                              {ch.timestamp?.[0] != null && (
                                <span style={{ color: c.text3, fontSize: "0.7rem", fontVariantNumeric: "tabular-nums", userSelect: "none" }}>
                                  [{fmtDur(ch.timestamp[0])}]{" "}
                                </span>
                              )}
                              {ch.text}
                            </span>
                          ))
                        : item.transcript
                      }
                    </div>

                    {/* Stats */}
                    <div style={{
                      padding: "10px 16px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}`,
                      display: "flex", gap: 16, flexWrap: "wrap",
                    }}>
                      {[
                        { icon: <FileText size={11} />, label: `${wc(item.transcript)} palavras` },
                        { icon: <Zap size={11} />, label: `${item.transcript.length} chars` },
                        { icon: <Clock size={11} />, label: `~${Math.ceil(wc(item.transcript) / 200)} min leitura` },
                      ].map(({ icon, label }) => (
                        <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem", color: c.text2, fontWeight: 500 }}>
                          <span style={{ color: c.text3 }}>{icon}</span>{label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── TRANSCRIBE BUTTON ── */}
          {hasIdle && !isProcessing && (
            <button onClick={startAll} style={{
              width: "100%", padding: "15px", marginBottom: 16,
              background: c.accent, color: "#fff", border: "none",
              borderRadius: 16, fontSize: "1rem", fontWeight: 800, cursor: "pointer",
              fontFamily: "inherit", letterSpacing: "-0.02em", transition: "all 0.2s",
              boxShadow: `0 4px 24px ${c.accentGlow}, 0 2px 8px rgba(0,0,0,0.2)`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <Zap size={18} />
              {idleItems.length > 1
                ? `Transcrever ${idleItems.length} arquivos`
                : isVideo(idleItems[0]?.file) ? "Transcrever vídeo" : "Transcrever áudio"
              }
            </button>
          )}

          {/* ── HOW TO ── */}
          <div style={{
            marginTop: 32, background: c.surface, border: `1.5px solid ${c.border}`,
            borderRadius: 20, overflow: "hidden", boxShadow: c.shadow,
          }}>
            {/* Header */}
            <div style={{
              padding: "14px 18px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: c.accentSoft, border: `1px solid ${c.accent}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mic size={14} color={c.accent} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "0.88rem" }}>Como usar</span>
            </div>

            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 20 }}>
              {/* WhatsApp Audio section */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Smartphone size={13} color={c.text2} />
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: c.text2 }}>
                    Áudio do WhatsApp
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { step: "No celular", desc: "Segure o áudio → Encaminhar → Salve no dispositivo ou envie para si mesmo → Baixe o arquivo" },
                    { step: "No WhatsApp Web", desc: "Passe o mouse sobre o áudio → Clique na setinha → Download" },
                  ].map(({ step, desc }, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                        background: c.accentSoft, border: `1px solid ${c.accent}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 800, color: c.accent,
                      }}>{i + 1}</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "0.83rem", marginBottom: 2 }}>{step}</p>
                        <p style={{ color: c.text2, fontSize: "0.78rem", lineHeight: 1.55 }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }} />

              {/* Video section */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Monitor size={13} color={c.text2} />
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: c.text2 }}>
                    Vídeo
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                    background: c.accentSoft, border: `1px solid ${c.accent}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 800, color: c.accent,
                  }}><ChevronRight size={14} /></div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.83rem", marginBottom: 2 }}>MP4, MOV, AVI, MKV</p>
                    <p style={{ color: c.text2, fontSize: "0.78rem", lineHeight: 1.55 }}>
                      Arraste ou selecione. O áudio é extraído automaticamente. Baixe o resultado como{" "}
                      <strong style={{ color: c.text }}>.txt</strong> ou <strong style={{ color: c.text }}>.srt</strong> (legenda com timestamps).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── FEATURES ── */}
          <div style={{
            display: "flex", marginTop: 16, borderRadius: 16, overflow: "hidden",
            border: `1.5px solid ${c.border}`, background: c.surface, boxShadow: c.shadow,
          }}>
            {[
              { Icon: Lock,  title: "Privado",   desc: "Nada sai do navegador",   color: "#6366f1" },
              { Icon: Zap,   title: "Rápido",    desc: "Whisper ONNX otimizado",  color: "#f59e0b" },
              { Icon: Gift,  title: "Gratuito",  desc: "Open source, sem limites", color: c.accent },
            ].map(({ Icon, title, desc, color }, i) => (
              <Fragment key={title}>
                {i > 0 && <div style={{ width: 1, alignSelf: "stretch", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }} />}
                <div style={{ flex: 1, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: color + "18", border: `1.5px solid ${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={18} color={color} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "0.83rem", marginBottom: 3 }}>{title}</p>
                    <p style={{ color: c.text2, fontSize: "0.72rem", lineHeight: 1.4 }}>{desc}</p>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>

          {/* ── FOOTER ── */}
          <footer style={{ textAlign: "center", padding: "2.5rem 0 1rem", marginTop: 32, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}` }}>
            <p style={{ color: c.text3, fontSize: "0.72rem", lineHeight: 1.7 }}>
              © {new Date().getFullYear()} Guebly · Whisper (MIT) + Transformers.js (Apache 2.0)
              <br />Open-source · Sem coleta de dados
            </p>
          </footer>
        </div>
      </div>
    </Layout>
  );
}
