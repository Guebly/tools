import React, { useState, useCallback, useRef, useMemo } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  Upload, Download, Copy, Trash2, Eye, Code2, CheckCircle,
  AlertCircle, Info, Github, X, Terminal, Globe, Shield,
  Star, FileText, Linkedin, Instagram, MessageCircle,
  Scissors,
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
  linkedin:  { label: "LinkedIn",  maxLen: 3500, icon: <Linkedin  size={13} /> },
  instagram: { label: "Instagram", maxLen: 2200, icon: <Instagram size={13} /> },
  whatsapp:  { label: "WhatsApp",  maxLen: 3500, icon: <MessageCircle size={13} /> },
};

const DOC_THEMES: Record<DocTheme, { label: string; icon: React.ReactNode }> = {
  terminal: { label: "Terminal", icon: <Terminal size={12} /> },
  premium:  { label: "Premium",  icon: <Star size={12} /> },
  minimal:  { label: "Minimal",  icon: <Eye size={12} /> },
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
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 16px", borderRadius: 10,
            background: "rgba(20,20,20,0.95)",
            border: `1px solid ${c[t.type]}40`,
            backdropFilter: "blur(12px)",
            color: c[t.type],
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {icons[t.type]}
          <span style={{ color: c[t.type], fontSize: 13, fontWeight: 600 }}>{t.msg}</span>
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

export default function ReadmePdf() {
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === "dark";

  const bd = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const surfBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)";
  const inputBg = isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.03)";

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

  // Stats
  const words      = useMemo(() => md.trim().split(/\s+/).filter(Boolean).length, [md]);
  const chars      = md.length;
  const lines      = md.split("\n").length;

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
    <Layout toolName="README to PDF" fullHeight>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <ToastStack toasts={toasts} />
        <input ref={fileRef} type="file" accept=".md,.txt,.markdown" style={{ display: "none" }} onChange={loadFile} />

        {/* ── Full-height split layout ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── LEFT PANEL: Editor ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "42%",
              minWidth: 320,
              borderRight: `1px solid ${bd}`,
              overflow: "hidden",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: `1px solid ${bd}`,
                background: surfBg,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                EDITOR
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn btn-sm"
                  onClick={() => copyText(md, "Markdown copiado!")}
                >
                  <Copy size={11} /> Copiar
                </button>
                <button
                  className="btn btn-sm"
                  onClick={downloadMd}
                >
                  <Download size={11} /> .md
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => { setMd(""); toast("info", "Editor limpo"); }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>

            {/* File upload area */}
            <div
              style={{
                margin: "12px 14px 0",
                padding: "12px 16px",
                border: `1.5px dashed ${dragging ? "var(--accent)" : bd}`,
                borderRadius: 10,
                background: dragging ? "var(--accent-soft)" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: "rgba(75,139,255,0.12)",
                    border: "1px solid rgba(75,139,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--accent)",
                  }}
                >
                  <Upload size={14} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
                    {filename
                      ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <FileText size={11} style={{ color: "var(--accent)" }} />{filename}
                        </span>
                      : "Arraste seu README.md aqui"
                    }
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                    .md · .txt · .markdown
                  </div>
                </div>
                {md !== DEMO_MD && (
                  <button
                    style={{
                      marginLeft: "auto", background: "none",
                      border: `1px solid rgba(239,68,68,0.3)`,
                      color: "#ef4444", borderRadius: 6,
                      padding: "3px 8px", fontSize: 11, cursor: "pointer",
                      fontFamily: "inherit", fontWeight: 600,
                    }}
                    onClick={e => { e.stopPropagation(); setMd(DEMO_MD); setFilename(""); toast("info", "Demo carregado"); }}
                  >
                    <X size={10} style={{ display: "inline", marginRight: 3 }} />Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Stats pills */}
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: "10px 14px",
                flexShrink: 0,
              }}
            >
              {[`${words.toLocaleString()} palavras`, `${chars.toLocaleString()} chars`, `${lines} linhas`].map(s => (
                <span key={s} style={{
                  fontSize: 10, fontWeight: 600,
                  padding: "3px 8px", borderRadius: 6,
                  border: `1px solid ${bd}`,
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                  color: "var(--muted)",
                }}>
                  {s}
                </span>
              ))}
            </div>

            {/* Textarea */}
            <div style={{ flex: 1, overflow: "hidden", padding: "0 14px 8px" }}>
              <textarea
                value={md}
                onChange={e => setMd(e.target.value)}
                placeholder="Cole ou escreva seu Markdown aqui..."
                style={{
                  width: "100%", height: "100%",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12.5, lineHeight: 1.7,
                  background: inputBg,
                  border: `1px solid ${bd}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "var(--text)",
                  resize: "none",
                  outline: "none",
                }}
              />
            </div>

            {/* Syntax tags */}
            <div
              style={{
                display: "flex", flexWrap: "wrap", gap: 5,
                padding: "8px 14px 12px",
                flexShrink: 0,
              }}
            >
              {["# H1", "**bold**", "*italic*", "`code`", "- lista", "> quote", "| table |"].map(tag => (
                <span
                  key={tag}
                  className="syntax-tag"
                  onClick={() => setMd(m => m + "\n" + tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL: Output ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {/* Tabs + actions header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: `1px solid ${bd}`,
                background: surfBg,
                flexShrink: 0,
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {/* Tab pills */}
              <div className="tab-group">
                {([
                  { key: "preview" as RightTab, icon: <Eye size={12} />,      label: "Preview" },
                  { key: "social"  as RightTab, icon: <Globe size={12} />,    label: "Social"  },
                  { key: "raw"     as RightTab, icon: <Terminal size={12} />, label: "HTML"    },
                ]).map(t => (
                  <button
                    key={t.key}
                    className={`tab ${rightTab === t.key ? "tab-active" : ""}`}
                    onClick={() => setRightTab(t.key)}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Right-side actions */}
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                {rightTab === "preview" && (
                  <>
                    {/* Theme pill buttons */}
                    <div style={{ display: "flex", gap: 4 }}>
                      {(Object.entries(DOC_THEMES) as [DocTheme, typeof DOC_THEMES[DocTheme]][]).map(([k, v]) => (
                        <button
                          key={k}
                          onClick={() => setDocTheme(k)}
                          className="btn btn-sm"
                          style={{
                            background: docTheme === k ? "var(--accent)" : undefined,
                            borderColor: docTheme === k ? "var(--accent)" : undefined,
                            color: docTheme === k ? "#fff" : undefined,
                          }}
                        >
                          {v.icon} {v.label}
                        </button>
                      ))}
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={printPdf}>
                      <Download size={11} /> Exportar PDF
                    </button>
                  </>
                )}
                {rightTab === "social" && (
                  <button className="btn btn-sm" onClick={() => copyText(chunks[0] ?? "", "Copiado!")}>
                    {copied ? <CheckCircle size={12} /> : <Copy size={12} />} Copiar
                  </button>
                )}
                {rightTab === "raw" && (
                  <button className="btn btn-sm" onClick={() => copyText(htmlPreview, "HTML copiado!")}>
                    <Copy size={12} /> HTML
                  </button>
                )}
              </div>
            </div>

            {/* Content area */}
            <div style={{ flex: 1, overflow: "auto" }}>

              {/* Preview Tab */}
              {rightTab === "preview" && (
                <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  {docTheme === "terminal" && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px",
                      background: "#252535",
                      flexShrink: 0,
                    }}>
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
                      flex: 1,
                      padding: "24px 28px",
                      ...(docTheme === "terminal" ? {
                        background: "#1C1C27", color: "#E2E8F0",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                      } : {
                        background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
                        color: "var(--text)",
                      }),
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlPreview || `<p style="color:var(--muted)">Nada para mostrar ainda...</p>` }}
                  />
                </div>
              )}

              {/* Social Tab */}
              {rightTab === "social" && (
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
                  {/* Platform tabs + split */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
                    <div className="tab-group">
                      {(Object.entries(PLATFORMS) as [Platform, typeof PLATFORMS[Platform]][]).map(([k, v]) => (
                        <button
                          key={k}
                          className={`tab ${platform === k ? "tab-active" : ""}`}
                          onClick={() => setPlatform(k)}
                        >
                          {v.icon} {v.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>
                        <input type="checkbox" checked={splitEnabled} onChange={e => setSplit(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
                        <Scissors size={11} /> Split
                      </label>
                      {splitEnabled && (
                        <input
                          type="number" value={maxLen}
                          onChange={e => setMaxLen(Number(e.target.value))}
                          min={200} max={10000}
                          style={{
                            width: 80, padding: "5px 9px", borderRadius: 8,
                            border: `1px solid ${bd}`,
                            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                            fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                            color: "var(--text)",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {chunks.length > 1 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
                      {chunks.map((c, i) => (
                        <button key={i} className="btn btn-sm" onClick={() => copyText(c, `Bloco ${i + 1} copiado!`)}>
                          <Copy size={10} /> Bloco {i + 1}
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)" }}>({c.length})</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <textarea
                    readOnly
                    value={chunks.join("\n\n────── PRÓXIMO BLOCO ──────\n\n")}
                    placeholder="Selecione a plataforma..."
                    style={{
                      flex: 1, width: "100%", minHeight: 200,
                      padding: "14px 16px", borderRadius: 10,
                      border: `1px solid ${bd}`,
                      background: inputBg,
                      fontSize: 13, lineHeight: 1.65,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: "var(--text)", resize: "none",
                    }}
                  />

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>
                    <Info size={11} />
                    {chunks.length} bloco(s) · {socialText.length.toLocaleString()} chars · limite {PLATFORMS[platform].maxLen.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Raw HTML Tab */}
              {rightTab === "raw" && (
                <pre style={{
                  margin: 0, height: "100%",
                  background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.04)",
                  color: isDark ? "#a5f3fc" : "#1e293b",
                  padding: "20px 22px",
                  fontSize: 11.5, lineHeight: 1.65,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap", wordBreak: "break-all",
                  fontFamily: "'JetBrains Mono', monospace",
                  borderTop: `1px solid ${bd}`,
                }}>
                  {htmlPreview || "Nada ainda..."}
                </pre>
              )}
            </div>

            {/* Export button pinned to bottom — only in preview */}
            {rightTab === "preview" && (
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: `1px solid ${bd}`,
                  background: surfBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>
                    <Star size={10} style={{ display: "inline", marginRight: 4 }} />
                    Open-source
                  </span>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>
                    <Shield size={10} style={{ display: "inline", marginRight: 4 }} />
                    Zero dados
                  </span>
                  <a href="https://github.com/guebly/guebly-readme-to-pdf" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 10, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                    <Github size={10} /> GitHub
                  </a>
                </div>
                <button className="btn btn-primary" onClick={printPdf}>
                  <Download size={13} /> Exportar PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
