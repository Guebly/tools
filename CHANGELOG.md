# Changelog

## 2026-06-09 - Correção de dark/light mode em todas as páginas

- **ReadmePdf.tsx** — `ToastStack` corrigido: fundo do toast agora é tema-aware (dark `rgba(20,20,20,0.95)` / light `rgba(255,255,255,0.97)`)
- **InstaPreview.tsx** — corrigido conflito de classes CSS: ao aplicar tema, remove corretamente `light-tool` ou `dark`; ao sair da página, restaura o tema global (`guebly-theme`) para não quebrar outras ferramentas
- **Home.tsx** — redesenho completo com `c` color object para dark/light, todos os hardcodes removidos

## 2026-06-09 - Redesign premium da UI/UX

- **Home.tsx** — redesenho completo: navbar topo (logo + badge "tools" + GitHub), hero com logo 80px + gradiente no título, 4 cards 2x2 com atalhos de teclado (1/2/3/4), animações de hover com glow colorido, rodapé minimalista "by Guebly"
- **Layout.tsx** — adicionada linha de 1px com gradiente IG no topo, toolname com estilo pill/badge, toggle de tema ligeiramente maior (w-9 h-9) e mais visível, link de volta mais refinado
- **TextFormatter.tsx** — redesenho do layout: seletor de plataforma como 3 abas pill side-by-side (LinkedIn/Instagram/WhatsApp), split de dois painéis ENTRADA/SAÍDA com labels claros, badge de status ATUALIZADA/DESATUALIZADA, controles de divisão movidos para o rodapé do painel de saída
- **ReadmePdf.tsx** — layout full-height dividido em dois painéis: esquerdo com upload (área dashed), stats pills (palavras/chars/linhas), textarea e syntax tags; direito com abas Preview/Social/HTML, seletor de tema como botões pill, botão exportar PDF fixo no rodapé
- **ZapTranscriber.tsx** — hero com ícone de microfone grande, dropzone maior e mais convidativa com ícone 72px, badges de features com estilo pill, barra de progresso com gradiente e glow
- **index.css** — melhorado font-size e line-height base, adicionada classe `.kbd` para badges de teclado, adicionada `.tool-header`, corrigido `html.light-tool body { background: #f4f6f9 }`

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

## 2026-06-09 - Suporte a tema claro/escuro (light/dark mode)

- Criado `src/contexts/ThemeContext.tsx` com ThemeProvider, toggle e persistência em localStorage (`guebly-theme`)
- `main.tsx`: envolvido App com ThemeProvider
- `Layout.tsx`: adicionado botão de toggle sol/lua (Sun/Moon do lucide-react) na barra de navegação
- `index.css`: expandida paleta completa de variáveis CSS para `html.light-tool`; `html/body` agora usa `var(--bg)`; adicionados estilos de scrollbar para modo claro
- `ZapTranscriber.tsx`: tema local movido para dentro do componente, tornando-o reativo ao ThemeContext (paleta verde escura/clara)
- `TextFormatter.tsx`: cores hardcoded substituídas por variáveis CSS (`var(--bg)`, `var(--text)`, `var(--border)`, etc.)
- `ReadmePdf.tsx`: estilos refatorados com funções que aceitam `isDark` para suportar ambos os modos
- `Home.tsx`: adicionado separador `border-top` no rodapé

## 2026-06-09 - Melhoria de UI/UX e identidade visual

- Adicionada logo oficial da Guebly (guebly.png 1024x1024) na pasta public
- Geradas versões otimizadas: logo-192.png (14KB), logo-64.png (3KB), favicon.png (1KB)
- Home.tsx: substituído placeholder "G" pela logo real da Guebly (logo-192.png)
- Home.tsx: melhorias visuais — cards com hover colorido por ferramenta, badges atualizados, footer com link GitHub + logo
- Layout.tsx: adicionada logo (logo-64.png) na barra de navegação de todas as ferramentas
- index.html: favicon atualizado para logo da Guebly, adicionadas meta tags Open Graph e Twitter Card completas
