import { useState, useRef, useCallback, useEffect } from "react";
import Layout from "../components/Layout";

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

const theme = {
  bg: "#0a0d0b",
  bg2: "#060806",
  surface2: "#182019",
  border: "#1c2b21",
  text: "#e6f0ea",
  text2: "#6b8575",
  text3: "#3d5447",
  accent: "#25D366",
  accentSoft: "rgba(37,211,102,0.08)",
  accentGlow: "rgba(37,211,102,0.15)",
  card: "#0f1512",
  cardBorder: "#1a2820",
  errBg: "#1a0e0e",
  errBd: "#331a1a",
  shadow: "0 2px 12px rgba(0,0,0,0.4)",
  heroGradient:
    "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37,211,102,0.06) 0%, transparent 70%)",
  warnColor: "#f59e0b",
};

const LANGS = [
  { v: "pt", l: "🇧🇷 Português" },
  { v: "en", l: "🇺🇸 English" },
  { v: "es", l: "🇪🇸 Español" },
  { v: "auto", l: "🔍 Auto" },
];

const MODELS = [
  {
    v: "onnx-community/whisper-tiny",
    l: "Tiny ~40 MB",
    desc: "Mais rápido, menos preciso",
  },
  {
    v: "onnx-community/whisper-base",
    l: "Base ~150 MB",
    desc: "Mais lento, mais preciso",
  },
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
  const t = theme;

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

    // ── Path A: AudioContext.decodeAudioData ──
    try {
      const arrayBuf = await item.file.arrayBuffer();
      if (arrayBuf.byteLength === 0) throw new Error("empty");
      const ctx = new AudioContext();
      let decoded: AudioBuffer;
      try {
        decoded = await ctx.decodeAudioData(arrayBuf);
      } finally {
        ctx.close();
      }
      const samples = await resample(decoded!);
      return { samples, duration: decoded!.duration };
    } catch (_) {
      // fall through to Path B
    }

    // ── Path B: MediaElement real-time capture ──
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
          reject(new Error(
            `Erro de mídia (código ${code}). ` +
            "Salve o arquivo no computador e tente novamente, ou converta para MP4/MP3.",
          ));
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

        processor.onaudioprocess = (e) => {
          collected.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        };

        source.connect(processor);
        processor.connect(silencer);
        silencer.connect(ctx.destination);

        el.addEventListener("ended", async () => {
          finish(async () => {
            processor.disconnect();
            silencer.disconnect();
            cleanup(ctx);

            const total = collected.reduce((s, c) => s + c.length, 0);
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
          finish(() => {
            cleanup(ctx);
            reject(new Error("Reprodução bloqueada pelo navegador. Tente novamente."));
          });
        });
      });
    });
  }, []);

  // ── Start next idle item in queue ──
  const startNext = useCallback(async (currentQueue: QueueItem[]) => {
    const next = currentQueue.find((i) => i.status === "idle");
    if (!next) {
      processingIdRef.current = null;
      setIsProcessing(false);
      return;
    }

    const id = next.id;
    processingIdRef.current = id;
    setIsProcessing(true);

    let audio: Float32Array, duration: number;
    try {
      const result = await decodeFile(next, () => {
        setQueue((q) =>
          q.map((item) =>
            item.id === id
              ? { ...item, status: "loading", statusMsg: "Extraindo áudio do vídeo…" }
              : item,
          ),
        );
      });
      audio = result.samples;
      duration = result.duration;
    } catch (err: any) {
      setQueue((q) => {
        const updated = q.map((item) =>
          item.id === id
            ? { ...item, status: "error" as const, error: "Erro ao decodificar: " + err.message }
            : item,
        );
        setTimeout(() => startNext(updated), 0);
        return updated;
      });
      processingIdRef.current = null;
      setIsProcessing(false);
      return;
    }

    if (processingIdRef.current !== id) return;

    const opts: Record<string, any> = {
      chunk_length_s: 28,
      stride_length_s: 6,
      return_timestamps: true,
      no_repeat_ngram_size: 3,
    };
    if (langRef.current !== "auto") opts.language = langRef.current;

    workerRef.current?.postMessage(
      { type: "transcribe", payload: { audio, opts, model: modelRef.current, duration } },
      [audio.buffer],
    );
  }, [decodeFile]);

  // ── Worker message handler ──
  const handleWorkerMessage = useCallback(
    ({ data }: MessageEvent) => {
      const { type, payload } = data;
      const id = processingIdRef.current;
      if (!id) return;

      if (type === "cached") {
        setQueue((q) =>
          q.map((item) =>
            item.id === id
              ? { ...item, status: "loading" as const, progress: 100, statusMsg: "Modelo em cache ✓" }
              : item,
          ),
        );
      } else if (type === "loading") {
        setQueue((q) =>
          q.map((item) =>
            item.id === id
              ? { ...item, status: "loading" as const, progress: 0, statusMsg: "Baixando modelo…" }
              : item,
          ),
        );
      } else if (type === "download_progress") {
        setQueue((q) =>
          q.map((item) =>
            item.id === id
              ? { ...item, progress: payload, statusMsg: `Baixando modelo… ${payload}%` }
              : item,
          ),
        );
      } else if (type === "transcribing") {
        setQueue((q) =>
          q.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "transcribing" as const,
                  progress: 0,
                  statusMsg: isVideo(item.file)
                    ? "Transcrevendo vídeo…"
                    : "Transcrevendo áudio…",
                }
              : item,
          ),
        );
      } else if (type === "trans_progress") {
        setQueue((q) =>
          q.map((item) =>
            item.id === id ? { ...item, progress: payload } : item,
          ),
        );
      } else if (type === "result") {
        const text =
          payload.text?.trim() ||
          payload.chunks?.map((c: any) => c.text).join(" ").trim() ||
          "";
        const chunks = payload.chunks || [];
        setQueue((q) => {
          const updated = q.map((item) =>
            item.id === id
              ? { ...item, status: "done" as const, transcript: text, chunks, progress: 100 }
              : item,
          );
          setTimeout(() => startNext(updated), 0);
          return updated;
        });
      } else if (type === "error") {
        setQueue((q) => {
          const updated = q.map((item) =>
            item.id === id ? { ...item, status: "error" as const, error: payload } : item,
          );
          setTimeout(() => startNext(updated), 0);
          return updated;
        });
      }
    },
    [startNext],
  );

  // ── Create / recreate worker ──
  const initWorker = useCallback(() => {
    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/whisper.worker.js", import.meta.url),
      { type: "module" },
    );
    worker.onmessage = handleWorkerMessage;
    workerRef.current = worker;
  }, [handleWorkerMessage]);

  useEffect(() => {
    initWorker();
    return () => workerRef.current?.terminate();
  }, [initWorker]);

  // ── Cancel current transcription ──
  const cancelTranscription = useCallback(() => {
    const id = processingIdRef.current;
    if (!id) return;
    processingIdRef.current = null;
    setIsProcessing(false);
    initWorker();
    setQueue((q) =>
      q.map((item) =>
        item.id === id
          ? { ...item, status: "idle" as const, progress: 0, elapsed: 0, statusMsg: "" }
          : item,
      ),
    );
  }, [initWorker]);

  // ── Elapsed timer ──
  useEffect(() => {
    if (!isProcessing) return;
    const timer = setInterval(() => {
      if (processingIdRef.current) {
        setQueue((q) =>
          q.map((item) =>
            item.id === processingIdRef.current
              ? { ...item, elapsed: (item.elapsed || 0) + 1 }
              : item,
          ),
        );
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isProcessing]);

  // ── Add files to queue ──
  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return;
    const newItems: QueueItem[] = Array.from(fileList).map((f) => {
      const url = URL.createObjectURL(f);
      const id = mkId();
      const sizeWarning =
        f.size === 0
          ? "Arquivo sem conteúdo (0 bytes). Baixe o arquivo para o seu computador antes de arrastar."
          : (isVideo(f) && f.size > 1_073_741_824) ||
            (!isVideo(f) && f.size > 209_715_200)
          ? `Arquivo grande (${fmtSize(f.size)}) — pode ser lento ou falhar.`
          : null;

      const item: QueueItem = {
        id,
        file: f,
        url,
        duration: 0,
        status: "idle",
        progress: 0,
        elapsed: 0,
        transcript: "",
        chunks: [],
        error: null,
        statusMsg: "",
        sizeWarning,
      };

      const a = new Audio(url);
      a.addEventListener("loadedmetadata", () => {
        setQueue((q) =>
          q.map((i) => (i.id === id ? { ...i, duration: a.duration } : i)),
        );
      });

      return item;
    });

    setQueue((q) => [...q, ...newItems]);
  }, []);

  const removeItem = useCallback((id: number) => {
    if (processingIdRef.current === id) return;
    setQueue((q) => {
      const item = q.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return q.filter((i) => i.id !== id);
    });
    setPlayingIds((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
    setCurTimes((c) => {
      const n = { ...c };
      delete n[id];
      return n;
    });
    delete audioRefsMap.current[id];
  }, []);

  const startAll = useCallback(() => {
    setQueue((q) => {
      setTimeout(() => startNext(q), 0);
      return q;
    });
  }, [startNext]);

  const retryItem = useCallback(
    (id: number) => {
      setQueue((q) => {
        const updated = q.map((i) =>
          i.id === id
            ? { ...i, status: "idle" as const, error: null, progress: 0, elapsed: 0 }
            : i,
        );
        setTimeout(() => startNext(updated), 0);
        return updated;
      });
    },
    [startNext],
  );

  const togglePlay = useCallback((id: number) => {
    const el = audioRefsMap.current[id];
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlayingIds((p) => ({ ...p, [id]: true }));
    } else {
      el.pause();
      setPlayingIds((p) => ({ ...p, [id]: false }));
    }
  }, []);

  const seek = useCallback((id: number, e: React.MouseEvent) => {
    const el = audioRefsMap.current[id];
    const item = queueRef.current.find((i) => i.id === id);
    if (!el || !item?.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.currentTime =
      Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) *
      item.duration;
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
    a.download =
      (item.file.name.replace(/\.[^.]+$/, "") || "transcricao") + ".txt";
    a.click();
  }, []);

  const downloadSrt = useCallback((id: number) => {
    const item = queueRef.current.find((i) => i.id === id);
    if (!item?.chunks?.length) return;
    const lines = item.chunks
      .filter((c) => c.timestamp?.[0] != null)
      .map((c, i) => {
        const start = fmtSRT(c.timestamp![0]);
        const end = fmtSRT(
          Math.max(
            c.timestamp![0] + 0.5,
            c.timestamp![1] ?? c.timestamp![0] + 3,
          ),
        );
        return `${i + 1}\n${start} --> ${end}\n${c.text.trim()}\n`;
      })
      .join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download =
      (item.file.name.replace(/\.[^.]+$/, "") || "legenda") + ".srt";
    a.click();
  }, []);

  // ── Derived state ──
  const idleItems = queue.filter((i) => i.status === "idle");
  const hasIdle = idleItems.length > 0;

  const transcribeLabel =
    idleItems.length > 1
      ? `⚡ Transcrever todos (${idleItems.length} arquivos)`
      : idleItems.length === 1
        ? isVideo(idleItems[0]?.file)
          ? "⚡ Transcrever vídeo"
          : "⚡ Transcrever áudio"
        : "";

  // ── Style helpers ──
  const toggleBtn = (active: boolean, disabled: boolean) => ({
    background: active ? t.accent : "transparent",
    color: active ? "#fff" : t.text2,
    border: `1.5px solid ${active ? t.accent : t.border}`,
    borderRadius: 10,
    padding: "7px 14px",
    fontSize: "0.78rem",
    fontWeight: active ? 700 : 500,
    cursor: disabled ? "default" : "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
    opacity: disabled ? 0.5 : 1,
  } as React.CSSProperties);

  const actionBtn = (hl: boolean) => ({
    background: hl ? t.accentSoft : "transparent",
    border: `1.5px solid ${hl ? t.accent : t.border}`,
    color: hl ? t.accent : t.text2,
    fontSize: "0.76rem",
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  } as React.CSSProperties);

  const stepBadge: React.CSSProperties = {
    background: t.accentGlow,
    color: t.accent,
    fontWeight: 800,
    fontSize: "0.72rem",
    width: 24,
    height: 24,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  return (
    <Layout toolName="ZapTranscriber">
      <div
        style={{
          minHeight: "100vh",
          background: t.bg,
          color: t.text,
          fontFamily:
            "'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        }}
      >
        {/* ═══ HERO ═══ */}
        <div
          style={{
            background: t.heroGradient,
            paddingTop: "3rem",
            paddingBottom: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: t.accentSoft,
              border: `1px solid ${t.accent}30`,
              borderRadius: 20,
              padding: "5px 14px",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: t.accent,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              ✦ Open Source · 100% gratuito
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 1.1,
              maxWidth: 760,
              margin: "0 auto",
            }}
          >
            Transcreva áudios e vídeos
            <br />
            <span style={{ color: t.accent }}>direto no navegador</span>
          </h1>

          <p
            style={{
              color: t.text2,
              fontSize: "1rem",
              lineHeight: 1.6,
              maxWidth: 660,
              margin: "16px auto 0",
            }}
          >
            Nenhum dado é enviado para servidores. O modelo de IA roda localmente
            no seu dispositivo. Suporta vários arquivos de uma vez.
          </p>

          <div
            style={{ color: t.text3, fontSize: "0.78rem", fontWeight: 500, display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}
          >
            {["🔒 100% privado", "⚡ Sem cadastro", "🌐 Multi-idioma"].map(
              (item) => (
                <span key={item}>{item}</span>
              ),
            )}
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px 40px" }}>

          {/* ── SETTINGS ROW ── */}
          <div
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {/* Language */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: t.text2,
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Idioma do áudio/vídeo:
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {LANGS.map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setLang(v)}
                    disabled={isProcessing}
                    style={toggleBtn(lang === v, isProcessing)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Model */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: t.text2,
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Modelo Whisper:
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {MODELS.map(({ v, l, desc }) => (
                  <button
                    key={v}
                    onClick={() => setModel(v)}
                    disabled={isProcessing}
                    style={toggleBtn(model === v, isProcessing)}
                    title={desc}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── DROPZONE ── */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            style={{
              border: `2px dashed ${dragOver ? t.accent : t.border}`,
              borderRadius: queue.length > 0 ? 12 : 20,
              padding: queue.length > 0 ? "0.85rem 1.5rem" : "3rem 2.5rem",
              textAlign: "center",
              cursor: "pointer",
              background: dragOver
                ? t.accentGlow
                : queue.length > 0
                  ? "transparent"
                  : t.card,
              transition: "all 0.3s",
              boxShadow: queue.length > 0 ? "none" : t.shadow,
              marginBottom: 16,
            }}
          >
            {queue.length === 0 ? (
              <>
                <div style={{ fontSize: 56, marginBottom: 16 }}>
                  {dragOver ? "📥" : "🎤"}
                </div>
                <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>
                  Arraste o áudio ou vídeo aqui
                </p>
                <p style={{ color: t.text2, fontSize: "0.85rem", marginBottom: 16 }}>
                  ou clique para selecionar — múltiplos arquivos suportados
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    gap: 6,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    maxWidth: 440,
                  }}
                >
                  {[".ogg",".opus",".mp3",".m4a",".wav",".webm",".mp4",".mov",".avi",".mkv"].map((ext) => (
                    <span
                      key={ext}
                      style={{
                        background: t.accentSoft,
                        color: t.text2,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 5,
                      }}
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <span style={{ fontSize: "0.82rem", color: t.text2, fontWeight: 600 }}>
                {dragOver ? "📥 Soltar aqui" : "+ Adicionar mais arquivos"}
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="audio/*,video/*,.ogg,.opus,.mp3,.m4a,.wav,.webm,.mp4,.mov,.avi,.mkv"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {/* ── QUEUE ── */}
          {queue.map((item) => {
            const itemBusy =
              item.status === "loading" || item.status === "transcribing";
            const playPct =
              item.duration > 0
                ? ((curTimes[item.id] || 0) / item.duration) * 100
                : 0;
            const isPlaying = !!playingIds[item.id];
            const isCurrentlyProcessing = processingIdRef.current === item.id;
            const hasSrt = item.chunks?.some((c) => c.timestamp?.[0] != null);

            return (
              <div
                key={item.id}
                style={{
                  marginBottom: 16,
                  background: t.card,
                  border: `1.5px solid ${
                    item.status === "done"
                      ? t.accent + "40"
                      : item.status === "error"
                        ? t.errBd
                        : t.cardBorder
                  }`,
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: t.shadow,
                }}
              >
                {/* File info row */}
                <div
                  style={{
                    padding: "1.1rem 1.3rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: t.accentGlow,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {isVideo(item.file) ? "🎬" : "🎵"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.file.name}
                    </div>
                    <div style={{ color: t.text2, fontSize: "0.76rem", marginTop: 2 }}>
                      {fmtSize(item.file.size)}
                      {item.duration > 0 && ` · ${fmtDur(item.duration)}`}
                    </div>
                    {item.sizeWarning && (
                      <div style={{ color: t.warnColor, fontSize: "0.7rem", marginTop: 2 }}>
                        ⚠️ {item.sizeWarning}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div style={{ flexShrink: 0, textAlign: "right", minWidth: 0, maxWidth: 160 }}>
                    {item.status === "idle" && (
                      <span style={{ fontSize: "0.7rem", color: t.text3, fontWeight: 600 }}>
                        Aguardando
                      </span>
                    )}
                    {itemBusy && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: t.accent,
                          fontWeight: 600,
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.statusMsg || "Processando…"}
                        {item.progress > 0 && item.status === "loading" ? "" : ` (${item.elapsed}s)`}
                      </span>
                    )}
                    {item.status === "done" && (
                      <span style={{ fontSize: "0.7rem", color: t.accent, fontWeight: 700 }}>
                        ✅ {item.elapsed}s
                      </span>
                    )}
                    {item.status === "error" && (
                      <span style={{ fontSize: "0.7rem", color: "#ef4444", fontWeight: 600 }}>
                        ❌ Erro
                      </span>
                    )}
                  </div>

                  {/* Play/pause */}
                  <button
                    onClick={() => togglePlay(item.id)}
                    style={{
                      background: isPlaying ? t.accent : "transparent",
                      border: `1.5px solid ${isPlaying ? t.accent : t.border}`,
                      color: isPlaying ? "#fff" : t.text,
                      borderRadius: 12,
                      width: 42,
                      height: 42,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 16,
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>

                  {/* Cancel or Remove */}
                  {isCurrentlyProcessing ? (
                    <button
                      onClick={cancelTranscription}
                      style={{
                        background: "none",
                        border: `1.5px solid ${t.border}`,
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 8,
                        fontFamily: "inherit",
                        flexShrink: 0,
                        transition: "all 0.2s",
                      }}
                    >
                      ✕ Cancelar
                    </button>
                  ) : (
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: t.text3,
                        cursor: "pointer",
                        fontSize: 20,
                        padding: 4,
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  )}

                  <audio
                    ref={(el) => {
                      if (el) audioRefsMap.current[item.id] = el;
                    }}
                    src={item.url}
                    onEnded={() =>
                      setPlayingIds((p) => ({ ...p, [item.id]: false }))
                    }
                    onTimeUpdate={(e) =>
                      setCurTimes((c) => ({
                        ...c,
                        [item.id]: (e.target as HTMLAudioElement).currentTime,
                      }))
                    }
                  />
                </div>

                {/* Seek bar */}
                <div
                  style={{
                    padding: "0 1.3rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: t.text3,
                      fontVariantNumeric: "tabular-nums",
                      minWidth: 32,
                      textAlign: "right",
                    }}
                  >
                    {fmtDur(curTimes[item.id] || 0)}
                  </span>
                  <div
                    onClick={(e) => seek(item.id, e)}
                    style={{
                      flex: 1,
                      height: 8,
                      background: t.surface2,
                      borderRadius: 4,
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: t.accent,
                        borderRadius: 4,
                        width: `${playPct}%`,
                        transition: "width 0.15s",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: t.text3,
                      fontVariantNumeric: "tabular-nums",
                      minWidth: 32,
                    }}
                  >
                    {fmtDur(item.duration)}
                  </span>
                </div>

                <div style={{ height: 1, background: t.border }} />

                {/* Progress bar */}
                {itemBusy && (
                  <div style={{ height: 4, background: t.bg2 }}>
                    <div
                      style={{
                        height: "100%",
                        width:
                          item.status === "transcribing" && item.progress === 0
                            ? "100%"
                            : `${item.progress}%`,
                        background: t.accent,
                        transition: item.progress > 0 ? "width 0.5s" : "none",
                        animation:
                          item.status === "transcribing" && item.progress === 0
                            ? "pulse 1.5s infinite"
                            : "none",
                        borderRadius: 2,
                      }}
                    />
                  </div>
                )}

                {/* Error state */}
                {item.status === "error" && (
                  <div>
                    <div
                      style={{
                        padding: "0.75rem 1.3rem",
                        background: t.errBg,
                        borderTop: `1px solid ${t.errBd}`,
                        fontSize: "0.82rem",
                        color: "#ef4444",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span style={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>
                        {item.error}
                      </span>
                      <button
                        onClick={() => retryItem(item.id)}
                        disabled={isProcessing}
                        style={{
                          background: "transparent",
                          border: "1.5px solid #ef4444",
                          color: "#ef4444",
                          borderRadius: 8,
                          padding: "5px 12px",
                          fontSize: "0.74rem",
                          fontWeight: 600,
                          cursor: isProcessing ? "default" : "pointer",
                          fontFamily: "inherit",
                          flexShrink: 0,
                          opacity: isProcessing ? 0.5 : 1,
                        }}
                      >
                        🔄 Tentar novamente
                      </button>
                    </div>
                  </div>
                )}

                {/* Result */}
                {item.status === "done" && item.transcript && (
                  <div>
                    {/* Actions */}
                    <div
                      style={{
                        padding: "0.85rem 1.3rem",
                        borderTop: `1px solid ${t.border}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={() => setShowTimestamps((s) => !s)}
                        style={actionBtn(showTimestamps)}
                      >
                        🕐 {showTimestamps ? "Com timestamps" : "Ver timestamps"}
                      </button>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => copyTranscript(item.id)}
                          style={actionBtn(copiedId === item.id)}
                        >
                          {copiedId === item.id ? "✓ Copiado" : "📋 Copiar"}
                        </button>
                        <button
                          onClick={() => downloadTxt(item.id)}
                          style={actionBtn(false)}
                        >
                          💾 .txt
                        </button>
                        {hasSrt && (
                          <button
                            onClick={() => downloadSrt(item.id)}
                            style={actionBtn(false)}
                          >
                            🎬 .srt
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Transcript */}
                    <div
                      style={{
                        padding: "1.3rem",
                        fontSize: "0.92rem",
                        lineHeight: 1.8,
                        maxHeight: 400,
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {showTimestamps && item.chunks?.length > 0
                        ? item.chunks.map((c, i) => (
                            <span key={i}>
                              {c.timestamp?.[0] != null && (
                                <span
                                  style={{
                                    color: t.text3,
                                    fontSize: "0.72rem",
                                    fontVariantNumeric: "tabular-nums",
                                    userSelect: "none",
                                  }}
                                >
                                  [{fmtDur(c.timestamp[0])}]{" "}
                                </span>
                              )}
                              {c.text}
                            </span>
                          ))
                        : item.transcript}
                    </div>

                    {/* Stats */}
                    <div
                      style={{
                        padding: "0.7rem 1.3rem",
                        borderTop: `1px solid ${t.border}`,
                        fontSize: "0.72rem",
                        color: t.text2,
                        fontWeight: 500,
                        display: "flex",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>📝 {wc(item.transcript)} palavras</span>
                      <span>🔤 {item.transcript.length} caracteres</span>
                      <span>⏱ ~{Math.ceil(wc(item.transcript) / 200)} min leitura</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── TRANSCRIBE ALL BUTTON ── */}
          {hasIdle && !isProcessing && (
            <button
              onClick={startAll}
              style={{
                width: "100%",
                padding: "1rem",
                background: t.accent,
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                marginBottom: 16,
                transition: "all 0.2s",
                letterSpacing: "-0.01em",
              }}
            >
              {transcribeLabel}
            </button>
          )}

          {/* ── HOW TO ── */}
          <div
            style={{
              marginTop: 32,
              background: t.card,
              border: `1.5px solid ${t.cardBorder}`,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: t.shadow,
            }}
          >
            <div
              style={{
                padding: "1rem 1.3rem",
                borderBottom: `1px solid ${t.border}`,
                fontWeight: 700,
                fontSize: "0.88rem",
              }}
            >
              📱 Como usar
            </div>
            <div style={{ padding: "1rem 1.3rem" }}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  color: t.text2,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                🎤 Áudio do WhatsApp
              </p>

              {[
                {
                  title: "No celular",
                  desc: "Segure o áudio → Encaminhar → Salve no dispositivo ou envie para si mesmo → Baixe o arquivo",
                },
                {
                  title: "No WhatsApp Web",
                  desc: "Passe o mouse sobre o áudio → Clique na setinha → Download",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: i === 0 ? 12 : 0,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={stepBadge}>{i + 1}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.84rem" }}>
                      {step.title}
                    </p>
                    <p style={{ color: t.text2, fontSize: "0.8rem", marginTop: 2 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}

              <div style={{ height: 1, background: t.border, margin: "16px 0" }} />

              <p
                style={{
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  color: t.text2,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                🎬 Vídeo
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={stepBadge}>1</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.84rem" }}>
                    Qualquer vídeo MP4, MOV, AVI, MKV
                  </p>
                  <p style={{ color: t.text2, fontSize: "0.8rem", marginTop: 2 }}>
                    Arraste o arquivo ou clique para selecionar. O áudio é
                    extraído automaticamente pelo navegador para transcrição.
                    Baixe o resultado como <strong>.txt</strong> ou{" "}
                    <strong>.srt</strong> (legenda com timestamps).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── FEATURES ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 24 }}>
            {[
              { icon: "🔒", title: "Privado", desc: "Nada sai do navegador" },
              { icon: "⚡", title: "Rápido", desc: "Modelo Whisper otimizado" },
              { icon: "🆓", title: "Gratuito", desc: "Open source, sem limites" },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: t.card,
                  border: `1.5px solid ${t.cardBorder}`,
                  borderRadius: 14,
                  padding: "1.1rem",
                  textAlign: "center",
                  boxShadow: t.shadow,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                <p style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: 4 }}>{title}</p>
                <p style={{ color: t.text2, fontSize: "0.72rem" }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* ── FOOTER ── */}
          <footer
            style={{
              textAlign: "center",
              padding: "2.5rem 0 1.5rem",
              borderTop: `1px solid ${t.border}`,
              marginTop: 40,
            }}
          >
            <p style={{ color: t.text3, fontSize: "0.72rem", lineHeight: 1.6 }}>
              Open Source · Whisper (MIT) + Transformers.js (Apache 2.0)
              <br />
              Feito com ❤️ no Brasil
            </p>
          </footer>
        </div>
      </div>
    </Layout>
  );
}
