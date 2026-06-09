# Changelog

## 2026-06-09 - Versão inicial do hub unificado

- Criado projeto `guebly-tools` com React 18 + Vite + TypeScript + Tailwind CSS v3
- Adicionada página Home com grid de 4 ferramentas em dark mode (#0a0a0a)
- Integrado **InstaPreview**: simulador de feed do Instagram com drag & drop, exportação PNG/PDF, templates, sessão localStorage, temas IG light/dark, modo apresentação, análise de paleta de cores
- Integrado **ZapTranscriber**: transcrição local de áudio/vídeo com Whisper AI via Web Worker, suporte a múltiplos arquivos, download .txt e .srt
- Integrado **Text Formatter**: formatação Markdown para WhatsApp (negrito/itálico real), LinkedIn e Instagram (modo compatível), divisão em blocos por tamanho
- Integrado **README to PDF**: editor Markdown com live preview, 3 temas PDF (Terminal/Premium/Minimal), formatador social, exportação via `window.print()`
- Configurado `vercel.json` com SPA rewrites e headers CORS para SharedArrayBuffer
- Configurado `vite.config.ts` com Web Worker ES module, excludes do @huggingface/transformers e headers CORS de dev
- Deploy em produção na Vercel: https://tools-guebly.vercel.app
- Domínio configurado: tools.guebly.com.br (aguardando propagação DNS Cloudflare)
- SSO Protection desativada (app público / open source)
- Corrigida ordem do @import Google Fonts antes das diretivas Tailwind
- Repos originais arquivados: guebly-insta-preview, guebly-zap-transcriber, guebly-text-formatter, guebly-readme-to-pdf
