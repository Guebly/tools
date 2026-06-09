# Guebly Tools

Hub unificado de ferramentas gratuitas da Guebly. SPA em React + Vite + TypeScript que combina 4 ferramentas independentes em uma única aplicação.

## Ferramentas incluídas

| Ferramenta | Rota | Descrição |
|---|---|---|
| **InstaPreview** | `/insta-preview` | Simule e organize seu feed do Instagram com drag & drop. Exporte como PNG ou PDF de proposta. |
| **ZapTranscriber** | `/zap-transcriber` | Transcreva áudios e vídeos do WhatsApp diretamente no navegador. Whisper AI local, 100% privado. |
| **Text Formatter** | `/text-formatter` | Converta Markdown para LinkedIn, Instagram e WhatsApp sem perder a formatação. |
| **README to PDF** | `/readme-pdf` | Converta arquivos Markdown em PDFs profissionais com 3 temas. Live preview, sem servidor. |

## Tecnologias

- **React 18** + TypeScript
- **Vite 5** — bundler
- **React Router DOM v6** — roteamento SPA
- **Tailwind CSS v3** — estilização utilitária
- **Framer Motion** — animações (InstaPreview)
- **@huggingface/transformers** — Whisper AI local (ZapTranscriber)
- **html2canvas** + **jsPDF** — exportação PNG e PDF
- **lucide-react** — ícones

## Como instalar

```bash
# Clone o repositório
git clone https://github.com/guebly/guebly-tools
cd guebly-tools

# Instale as dependências
npm install
```

## Como rodar

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

A aplicação estará disponível em `http://localhost:5173`.

## Estrutura de pastas

```
src/
├── components/          # Componentes compartilhados (Layout)
├── insta/               # Módulos do InstaPreview
│   ├── components/      # Componentes do simulador de feed
│   ├── types.ts         # TypeScript interfaces
│   ├── utils.ts         # Utilitários gerais
│   ├── igColors.ts      # Sistema de cores do Instagram
│   ├── session.ts       # Persistência de sessão (localStorage)
│   ├── exportPreview.ts # Exportação PNG
│   ├── pdfExport.ts     # Exportação PDF proposta
│   ├── feedAnalyzer.ts  # Análise de paleta de cores
│   ├── templates.ts     # Templates de perfil
│   └── sampleImages.ts  # Imagens de exemplo
├── lib/                 # Bibliotecas compartilhadas
│   ├── markdown.ts      # Parser Markdown client-side
│   └── textFormatters.ts # Formatadores para WhatsApp/LinkedIn/Instagram
├── pages/               # Páginas roteadas
│   ├── Home.tsx         # Hub principal
│   ├── InstaPreview.tsx # Simulador de feed Instagram
│   ├── ZapTranscriber.tsx # Transcritor de áudio/vídeo
│   ├── TextFormatter.tsx  # Formatador de texto
│   └── ReadmePdf.tsx      # README para PDF
├── workers/
│   └── whisper.worker.js  # Web Worker do Whisper AI
├── App.tsx              # Roteamento principal
├── main.tsx             # Entry point
└── index.css            # Estilos globais + Tailwind
```

## Configuração especial

### CORS Headers (ZapTranscriber)
O ZapTranscriber usa `SharedArrayBuffer`, que exige headers CORS específicos:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```
Esses headers estão configurados no `vite.config.ts` (dev) e no `vercel.json` (produção).

### Web Worker
O Whisper AI roda em um Web Worker ES module separado. O formato de worker está configurado em `vite.config.ts`:
```ts
worker: { format: 'es' }
```

## Deploy (Vercel)

O arquivo `vercel.json` já inclui:
- Rewrite para SPA (`/* → /index.html`)
- Headers CORS necessários para o ZapTranscriber

## Exemplos de uso

### InstaPreview
1. Acesse `/insta-preview`
2. Preencha o perfil na sidebar esquerda
3. Faça upload de fotos para o feed
4. Arraste para reorganizar
5. Clique em "Exportar PNG" ou "Exportar PDF"

### ZapTranscriber
1. Acesse `/zap-transcriber`
2. Selecione o idioma e o modelo Whisper
3. Arraste um arquivo de áudio/vídeo
4. Clique em "Transcrever"
5. Copie ou baixe o resultado

### Text Formatter
1. Acesse `/text-formatter`
2. Selecione a plataforma (LinkedIn, Instagram, WhatsApp)
3. Cole seu texto Markdown na entrada
4. Clique em "EXECUTAR"
5. Copie o texto formatado

### README to PDF
1. Acesse `/readme-pdf`
2. Arraste ou cole seu arquivo `.md`
3. Escolha o tema (Terminal, Premium, Minimal)
4. Clique em "Exportar PDF"

## Licença

MIT — open source, use como quiser.

---

Feito com ❤️ pela [Guebly](https://www.guebly.com.br)
