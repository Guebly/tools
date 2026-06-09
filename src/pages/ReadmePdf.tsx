import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  Upload, Download, Copy, Trash2, Eye, Code2, CheckCircle,
  AlertCircle, Info, Github, X, Terminal, Globe, Shield,
  Star, FileText, Linkedin, Instagram, MessageCircle,
  ChevronDown, Scissors,
} from "lucide-react";
import Layout from "../components/Layout";
import { parseMarkdown } from "../lib/markdown";
import {
  formatForWhatsApp, formatForLinkedIn, formatForInstagram, splitByMaxLen,
} from "../lib/textFormatters";

type RightTab = "preview" | "social" | "raw";
type Platform = "linkedin" | "instagram" | "whatsapp";
type DocTheme = "terminal" | "premium" | "minimal";
type ToastType = "success" | "error" | "info";

interface Toast { id: number; type: ToastType; msg: string; }

const PLATFORMS: Record<Platform, { label: string; maxLen: number; icon: React.ReactNode }> = {
  linkedin:  { label: "LinkedIn",  maxLen: 3500, icon: <Linkedin  size={12} /> },
  instagram: { label: "Instagram", maxLen: 2200, icon: <Instagram size={12} /> },
  whatsapp:  { label: "WhatsApp",  maxLen: 3500, icon: <MessageCircle size={12} /> },
};

const DOC_THEMES: Record<DocTheme, { label: string }> = {
  terminal: { label: "Terminal" },
  premium:  { label: "Premium" },
  minimal:  { label: "Minimal" },
};

const DEMO_MD = `# guebly.pdf

> Transforme qualquer README.md em um PDF premium. Open-source, zero coleta de dados.

## 🚀 Features

- **Drag & drop** de arquivos \`.md\`, \`.txt\` ou \`.markdown\`
- **Live preview** com três temas visuais
- **Formatador social** para LinkedIn, Instagram e WhatsApp
- **Export PDF** via browser, sem servidor

## 📦 Instalação

\`\`\`bash
git clone https://github.com/guebly/guebly-readme-to-pdf
cd guebly-readme-to-pdf
npm install && npm run dev
\`\`\`

## 🛠 Stack

| Ferramenta | Função |
|---|---|
| React + Vite | Frontend |
| TypeScript | Tipagem |
| Tailwind CSS | Styling |

## Licença

MIT — use como quiser.
`;

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((type: ToastType, msg: string) => {
    const id = Date.now();
    setToasts(t => [...t, { id, type, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);
  return { toasts, add };
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  const c: Record<ToastType, string> = {
    success: "#22c55e",
    error:   "#ef4444",
    info:    "#3b82f6",
  };
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={14} />,
    error:   <AlertCircle size={14} />,
    info:    <Info size={14} />,
  };
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(20,20,20,0.95)",
            border: `1px solid ${c[t.type]}40`,
            backdropFilter: "blur(12px)",
            color: c[t.type],
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {icons[t.type]}
          <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function Stats({ md }: { md: string }) {
  const words      = useMemo(() => md.trim().split(/\s+/).filter(Boolean).length, [md]);
  const chars      = md.length;
  const lines      = md.split("\n").length;
  const headings   = (md.match(/^#{1,6}\s/gm) ?? []).length;
  const codeBlocks = Math.floor(((md.match(/```/g) ?? []).length) / 2);

  const items = [
    { num: words.toLocaleString(),  label: "Palavras" },
    { num: chars.toLocaleString(),  label: "Chars"    },
    { num: lines.toLocaleString(),  label: "Linhas"   },
    { num: headings,                label: "Títulos"  },
    { num: codeBlocks,              label: "Blocos"   },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(85px, 1fr))", gap: 8 }}>
      {items.map(s => (
        <div
          key={s.label}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "10px 12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: "#ffffff" }}>{s.num}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function getPdfStyles(docTheme: DocTheme): string {
  const base = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');`;
  const footer = `
    .guebly-footer{margin-top:56px;padding-top:14px;border-top:1px solid rgba(0,0,0,.09);display:flex;align-items:center;justify-content:space-between;gap:12}
    .guebly-footer span{font-size:11px;color:#9CA3AF;font-family:'Plus Jakarta Sans',sans-serif}
    .guebly-footer img{height:16px;width:auto;opacity:.5}
  `;
  if (docTheme === "terminal") return base + `
    body{background:#1C1C27;color:#E2E8F0;font-family:'JetBrains Mono',monospace;padding:48px;line-height:1.7}
    h1{color:#7EB0FF;font-size:2em;border-bottom:2px solid #2D2D42;padding-bottom:10px;margin-bottom:20px}
    h2{color:#A78BFA;font-size:1.4em;margin:1.4em 0 .5em}
    h3{color:#86EFAC;font-size:1.1em;margin:1em 0 .4em}
    pre{background:#252535;padding:16px;border-radius:10px;margin:12px 0;border-left:3px solid #7EB0FF;overflow-x:auto}
    code{color:#F9A8D4;font-family:'JetBrains Mono',monospace;font-size:.9em}
    pre code{color:#E2E8F0}
    blockquote{border-left:3px solid #A78BFA;padding-left:16px;margin:12px 0;color:#9CA3AF;font-style:italic}
    table{width:100%;border-collapse:collapse;margin:12px 0}
    th{background:#252535;padding:10px 14px;text-align:left;color:#7EB0FF;border:1px solid #2D2D42}
    td{padding:8px 14px;border:1px solid #2D2D42}
    tr:nth-child(even) td{background:#202030}
    a{color:#7EB0FF} hr{border:none;border-top:1px solid #2D2D42;margin:20px 0}
    ul,ol{padding-left:24px;margin:8px 0} li{margin:4px 0}
    img{max-width:100%;border-radius:8px}
    .guebly-footer{border-top-color:rgba(255,255,255,.08)!important}
    .guebly-footer span{color:#4B5563!important}
  ` + footer;
  if (docTheme === "minimal") return base + `
    body{background:#fff;color:#141210;font-family:'Plus Jakarta Sans',sans-serif;padding:64px;max-width:740px;margin:auto;line-height:1.75}
    h1{font-size:2.2em;font-weight:800;letter-spacing:-.04em;border-bottom:3px solid #141210;padding-bottom:10px;margin-bottom:20px}
    h2{font-size:1.4em;font-weight:700;letter-spacing:-.02em;margin:1.4em 0 .5em}
    h3{font-size:1.1em;font-weight:700;margin:1em 0 .4em}
    pre{background:#F4F4F4;padding:16px;border-radius:8px;margin:12px 0;font-family:'JetBrains Mono',monospace;font-size:13px;overflow-x:auto}
    code{background:#EFEFEF;padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:13px}
    pre code{background:transparent;padding:0}
    blockquote{border-left:4px solid #141210;padding-left:16px;margin:12px 0;color:#555}
    table{width:100%;border-collapse:collapse;margin:12px 0}
    th{border-bottom:2px solid #141210;padding:8px 12px;text-align:left;font-weight:800}
    td{padding:8px 12px;border-bottom:1px solid #EFEFEF}
    a{color:#141210} hr{border:none;border-top:2px solid #141210;margin:20px 0}
    ul,ol{padding-left:24px;margin:8px 0} li{margin:4px 0}
    img{max-width:100%}
  ` + footer;
  return base + `
    body{background:#fff;color:#141210;font-family:'Plus Jakarta Sans',sans-serif;padding:56px;max-width:820px;margin:auto;line-height:1.75}
    h1{font-size:2.2em;font-weight:800;letter-spacing:-.04em;color:#141210;border-bottom:3px solid #1A56DB;padding-bottom:10px;margin-bottom:20px}
    h2{font-size:1.4em;font-weight:700;color:#1A56DB;margin:1.4em 0 .5em;letter-spacing:-.02em}
    h3{font-size:1.1em;font-weight:700;margin:1em 0 .4em}
    pre{background:#F6F8FF;padding:18px 20px;border-radius:10px;margin:14px 0;font-family:'JetBrains Mono',monospace;font-size:13px;border-left:4px solid #1A56DB;overflow-x:auto}
    code{background:#EEF4FF;color:#1A56DB;padding:2px 7px;border-radius:5px;font-family:'JetBrains Mono',monospace;font-size:13px}
    pre code{background:transparent;color:#374151;padding:0}
    blockquote{border-left:4px solid #7E3AF2;padding-left:16px;margin:14px 0;color:#555;font-style:italic}
    table{width:100%;border-collapse:collapse;margin:14px 0;font-size:14px}
    th{background:#EEF4FF;padding:10px 14px;text-align:left;font-weight:700;border:1px solid #E5E7EB;color:#1A56DB}
    td{padding:9px 14px;border:1px solid #E5E7EB}
    tr:nth-child(even) td{background:#F9FAFB}
    a{color:#1A56DB;text-decoration:underline}
    hr{border:none;border-top:2px solid #E5E7EB;margin:20px 0}
    ul,ol{padding-left:24px;margin:8px 0} li{margin:5px 0}
    img{max-width:100%;border-radius:8px;margin:8px 0}
    strong{font-weight:700} em{font-style:italic;color:#555}
  ` + footer;
}

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  overflow: "hidden",
};

const panelHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  gap: 8,
  flexWrap: "wrap",
};

const btnStyle = (primary?: boolean, danger?: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 12px",
  borderRadius: 8,
  border: `1px solid ${danger ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
  background: primary ? "#1A56DB" : danger ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
  color: primary ? "#fff" : danger ? "#ef4444" : "rgba(255,255,255,0.7)",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.2s",
  whiteSpace: "nowrap" as const,
});

const tabGroupStyle: React.CSSProperties = {
  display: "flex",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  overflow: "hidden",
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  background: active ? "#1A56DB" : "transparent",
  color: active ? "#fff" : "rgba(255,255,255,0.5)",
  fontFamily: "inherit",
  transition: "all 0.2s",
});

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "3px 8px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.4)",
  fontSize: 10,
  fontWeight: 600,
};

export default function ReadmePdf() {
  const [md, setMd]               = useState(DEMO_MD);
  const [rightTab, setRightTab]   = useState<RightTab>("preview");
  const [platform, setPlatform]   = useState<Platform>("linkedin");
  const [splitEnabled, setSplit]  = useState(false);
  const [maxLen, setMaxLen]       = useState(3500);
  const [dragging, setDragging]   = useState(false);
  const [docTheme, setDocTheme]   = useState<DocTheme>("premium");
  const [filename, setFilename]   = useState("");
  const [copied, setCopied]       = useState(false);
  const { toasts, add: toast }    = useToast();
  const fileRef                   = useRef<HTMLInputElement>(null);

  const htmlPreview = useMemo(() => parseMarkdown(md), [md]);

  const socialText = useMemo(() => {
    if (platform === "whatsapp")  return formatForWhatsApp(md);
    if (platform === "instagram") return formatForInstagram(md);
    return formatForLinkedIn(md);
  }, [platform, md]);

  const chunks = useMemo(() =>
    splitEnabled ? splitByMaxLen(socialText, maxLen || 3500) : [socialText],
  [socialText, splitEnabled, maxLen]);

  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.match(/\.(md|txt|markdown)$/i)) { toast("error", "Somente .md ou .txt"); return; }
    setFilename(file.name);
    const r = new FileReader();
    r.onload = ev => { setMd(ev.target?.result as string ?? ""); toast("success", `${file.name} carregado!`); };
    r.readAsText(file);
  }, [toast]);

  const loadFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setFilename(file.name);
    const r = new FileReader();
    r.onload = ev => { setMd(ev.target?.result as string ?? ""); toast("success", `${file.name} carregado!`); };
    r.readAsText(file);
  }, [toast]);

  const copyText = useCallback(async (text: string, msg?: string) => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
    toast("success", msg ?? "Copiado!");
  }, [toast]);

  const downloadMd = useCallback(() => {
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = filename || "document.md"; a.click();
    toast("success", "Download iniciado!");
  }, [md, filename, toast]);

  const printPdf = useCallback(() => {
    const win = window.open("", "_blank"); if (!win) return;
    const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const footerHtml = `<div class="guebly-footer"><img src="https://www.guebly.com.br/guebly.png" alt="Guebly" /><span>Emitido por Guebly &middot; ${date}</span></div>`;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename || "README"}</title><style>${getPdfStyles(docTheme)}</style></head><body>${htmlPreview}${footerHtml}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
    toast("success", "Abrindo para impressão...");
  }, [htmlPreview, docTheme, filename, toast]);

  return (
    <Layout toolName="README to PDF">
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ffffff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <ToastStack toasts={toasts} />
        <input ref={fileRef} type="file" accept=".md,.txt,.markdown" style={{ display: "none" }} onChange={loadFile} />

        {/* Background blobs */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -300, right: -200, width: 600, height: 600, borderRadius: "50%", opacity: 0.3, background: "radial-gradient(circle, rgba(26,86,219,0.2) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: -200, left: -150, width: 500, height: 500, borderRadius: "50%", opacity: 0.2, background: "radial-gradient(circle, rgba(126,58,242,0.2) 0%, transparent 70%)" }} />
        </div>

        {/* Sub-header */}
        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src="https://www.guebly.com.br/guebly.png" alt="Guebly" style={{ height: 28, width: "auto", objectFit: "contain" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#ffffff" }}>.pdf</span>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>README to PDF</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={badgeStyle}><Star size={9} /> Open-source</span>
              <span style={badgeStyle}><Shield size={9} /> Zero dados</span>
              <a href="https://github.com/guebly/guebly-readme-to-pdf" target="_blank" rel="noopener noreferrer" style={{ ...btnStyle(), textDecoration: "none" }}>
                <Github size={13} /> GitHub
              </a>
            </div>
          </div>
        </header>

        {/* Main */}
        <main style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", padding: "28px 24px 56px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Drop Zone */}
          <div
            style={{
              padding: "24px 28px",
              border: `2px dashed ${dragging ? "#1A56DB" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 14,
              cursor: "pointer",
              background: dragging ? "rgba(26,86,219,0.08)" : "rgba(255,255,255,0.02)",
              transition: "all 0.3s",
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: "rgba(26,86,219,0.15)", border: "1px solid rgba(26,86,219,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                <Upload size={20} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>
                  {filename
                    ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><FileText size={14} style={{ color: "#3b82f6" }} />{filename}</span>
                    : "Arraste seu README.md aqui"
                  }
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  ou clique para selecionar · .md · .txt · .markdown
                </div>
              </div>
              {md !== DEMO_MD && (
                <button
                  style={{ ...btnStyle(false, true), marginLeft: "auto" }}
                  onClick={e => { e.stopPropagation(); setMd(DEMO_MD); setFilename(""); toast("info", "Demo carregado"); }}
                >
                  <X size={12} /> Limpar
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <Stats md={md} />

          {/* Editor Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16, alignItems: "start" }}>

            {/* Left: Editor */}
            <div style={cardStyle}>
              <div style={panelHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(26,86,219,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                    <Code2 size={13} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#ffffff" }}>Editor</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 2 }}>
                    {md.length.toLocaleString()} chars
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={btnStyle(false, true)} onClick={() => { setMd(""); toast("info", "Editor limpo"); }} title="Limpar">
                    <Trash2 size={12} />
                  </button>
                  <button style={btnStyle()} onClick={() => copyText(md, "Markdown copiado!")}>
                    <Copy size={12} /> Copiar
                  </button>
                  <button style={btnStyle()} onClick={downloadMd}>
                    <Download size={12} /> .md
                  </button>
                </div>
              </div>

              <div style={{ padding: 6, background: "rgba(0,0,0,0.3)", margin: "0 8px 8px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
                <textarea
                  value={md}
                  onChange={e => setMd(e.target.value)}
                  placeholder="Cole ou escreva seu Markdown aqui..."
                  style={{
                    width: "100%", minHeight: 480, padding: "12px 14px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12.5, lineHeight: 1.65,
                    background: "transparent", border: "none", outline: "none",
                    color: "#e2e8f0", resize: "vertical",
                  }}
                />
              </div>

              <div style={{ padding: "0 16px 14px", display: "flex", flexWrap: "wrap", gap: 5 }}>
                {["# H1", "**bold**", "*italic*", "`code`", "- lista", "> quote", "---", "| table |"].map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                    }}
                    onClick={() => setMd(m => m + "\n" + tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Output */}
            <div style={cardStyle}>
              <div style={panelHeaderStyle}>
                {/* Tabs */}
                <div style={tabGroupStyle}>
                  {([
                    { key: "preview", icon: <Eye size={12} />,      label: "Preview" },
                    { key: "social",  icon: <Globe size={12} />,    label: "Social"  },
                    { key: "raw",     icon: <Terminal size={12} />, label: "HTML"    },
                  ] as const).map(t => (
                    <button
                      key={t.key}
                      style={tabStyle(rightTab === t.key)}
                      onClick={() => setRightTab(t.key)}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  {rightTab === "preview" && (
                    <>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <select
                          value={docTheme}
                          onChange={e => setDocTheme(e.target.value as DocTheme)}
                          style={{
                            padding: "6px 28px 6px 10px", borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                            fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          {Object.entries(DOC_THEMES).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={11} style={{ position: "absolute", right: 8, pointerEvents: "none", color: "rgba(255,255,255,0.4)" }} />
                      </div>
                      <button style={btnStyle(true)} onClick={printPdf}>
                        <Download size={12} /> Exportar PDF
                      </button>
                    </>
                  )}
                  {rightTab === "social" && (
                    <button style={btnStyle()} onClick={() => copyText(chunks[0] ?? "", "Copiado!")}>
                      {copied ? <CheckCircle size={12} /> : <Copy size={12} />} Copiar
                    </button>
                  )}
                  {rightTab === "raw" && (
                    <button style={btnStyle()} onClick={() => copyText(htmlPreview, "HTML copiado!")}>
                      <Copy size={12} /> HTML
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Tab */}
              {rightTab === "preview" && (
                <div style={{ padding: "4px 8px 8px" }}>
                  {docTheme === "terminal" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "#252535", borderRadius: "10px 10px 0 0" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56", display: "inline-block" }} />
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E", display: "inline-block" }} />
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />
                      <span style={{ marginLeft: 8, fontSize: 11, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>
                        {filename || "README.md"}
                      </span>
                    </div>
                  )}
                  <div
                    className="preview-body"
                    style={{
                      padding: "20px 22px",
                      overflowY: "auto",
                      maxHeight: 560,
                      ...(docTheme === "terminal" ? {
                        background: "#1C1C27", color: "#E2E8F0",
                        borderRadius: "0 0 10px 10px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                      } : {
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "#e2e8f0",
                      }),
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlPreview || `<p style="color:rgba(255,255,255,0.3)">Nada para mostrar ainda...</p>` }}
                  />
                </div>
              )}

              {/* Social Tab */}
              {rightTab === "social" && (
                <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={tabGroupStyle}>
                      {(Object.entries(PLATFORMS) as [Platform, typeof PLATFORMS[Platform]][]).map(([k, v]) => (
                        <button key={k} style={tabStyle(platform === k)} onClick={() => setPlatform(k)}>
                          {v.icon} {v.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                        <input type="checkbox" checked={splitEnabled} onChange={e => setSplit(e.target.checked)} style={{ accentColor: "#1A56DB" }} />
                        <Scissors size={11} /> Split
                      </label>
                      {splitEnabled && (
                        <input
                          type="number" value={maxLen}
                          onChange={e => setMaxLen(Number(e.target.value))}
                          min={200} max={10000}
                          style={{
                            width: 76, padding: "5px 9px", borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                            fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                            color: "#ffffff",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {chunks.length > 1 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {chunks.map((c, i) => (
                        <button key={i} style={btnStyle()} onClick={() => copyText(c, `Bloco ${i + 1} copiado!`)}>
                          <Copy size={10} /> Bloco {i + 1}
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>({c.length})</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <textarea
                    readOnly
                    value={chunks.join("\n\n────── PRÓXIMO BLOCO ──────\n\n")}
                    placeholder="Selecione a plataforma..."
                    style={{
                      width: "100%", minHeight: 420, padding: "14px 16px",
                      borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(0,0,0,0.3)", fontSize: 13, lineHeight: 1.65,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: "#ffffff", resize: "vertical",
                    }}
                  />

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    <Info size={11} />
                    {chunks.length} bloco(s) · {socialText.length.toLocaleString()} chars · limite {PLATFORMS[platform].maxLen.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Raw HTML Tab */}
              {rightTab === "raw" && (
                <div style={{ padding: "8px 8px 8px" }}>
                  <pre style={{
                    background: "rgba(0,0,0,0.4)", color: "#a5f3fc",
                    padding: "16px 18px", borderRadius: 10,
                    fontSize: 11.5, lineHeight: 1.6,
                    overflowX: "auto", overflowY: "auto", maxHeight: 560,
                    whiteSpace: "pre-wrap", wordBreak: "break-all",
                    fontFamily: "'JetBrains Mono', monospace",
                    margin: 0,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    {htmlPreview || "Nada ainda..."}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap", padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8 }}>
            <img src="https://www.guebly.com.br/guebly.png" alt="Guebly" style={{ height: 18, width: "auto", opacity: 0.5 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} Guebly</span>
            <span style={badgeStyle}><Star size={9} /> Open-source</span>
            <span style={badgeStyle}><Shield size={9} /> Sem coleta</span>
            <a href="https://github.com/guebly/guebly-readme-to-pdf" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
              <Github size={12} /> guebly/guebly-readme-to-pdf
            </a>
          </footer>
        </main>
      </div>
    </Layout>
  );
}
