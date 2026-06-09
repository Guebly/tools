import { useNavigate } from 'react-router-dom'

interface Tool {
  path: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  color: string
  glow: string
  icon: React.ReactNode
}

const tools: Tool[] = [
  {
    path: '/insta-preview',
    title: 'InstaPreview',
    subtitle: 'Simulador de Feed',
    description: 'Simule e organize seu feed do Instagram com drag & drop. Exporte como PNG ou PDF de proposta.',
    tags: ['Drag & Drop', 'Templates', 'Export PDF'],
    color: 'from-pink-500/20 to-purple-600/20',
    glow: 'hover:shadow-[0_0_30px_rgba(220,39,67,0.25)]',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433"/>
            <stop offset="45%" stopColor="#dc2743"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig1)" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" stroke="url(#ig1)" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig1)"/>
      </svg>
    ),
  },
  {
    path: '/zap-transcriber',
    title: 'ZapTranscriber',
    subtitle: 'Transcritor de Áudio',
    description: 'Transcreva áudios e vídeos do WhatsApp diretamente no navegador. Whisper AI local, 100% privado.',
    tags: ['Whisper AI', 'Sem backend', 'SRT'],
    color: 'from-green-500/20 to-emerald-600/20',
    glow: 'hover:shadow-[0_0_30px_rgba(37,211,102,0.2)]',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        <circle cx="9" cy="10" r="1" fill="#25D366"/>
        <circle cx="12" cy="10" r="1" fill="#25D366"/>
        <circle cx="15" cy="10" r="1" fill="#25D366"/>
      </svg>
    ),
  },
  {
    path: '/text-formatter',
    title: 'Text Formatter',
    subtitle: 'Formatador de Texto',
    description: 'Converta Markdown para LinkedIn, Instagram e WhatsApp. Sem perder a formatação na hora de postar.',
    tags: ['LinkedIn', 'Instagram', 'WhatsApp'],
    color: 'from-blue-500/20 to-cyan-600/20',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h10"/>
        <path d="M17 15l2 2 4-4" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    path: '/readme-pdf',
    title: 'README to PDF',
    subtitle: 'README para PDF',
    description: 'Converta arquivos Markdown em PDFs profissionais com 3 temas. Live preview, sem servidor.',
    tags: ['Markdown', '3 Temas', 'Live Preview'],
    color: 'from-orange-500/20 to-red-600/20',
    glow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#ffffff' }}>
      {/* Background dots */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px]"
          style={{ background: 'rgba(220,39,67,0.06)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[100px]"
          style={{ background: 'rgba(37,211,102,0.04)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}>
            <span className="text-white font-black text-4xl" style={{ fontFamily: 'Inter, sans-serif' }}>G</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight mb-3"
            style={{ letterSpacing: '-0.04em' }}>
            Guebly{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Tools
            </span>
          </h1>

          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Ferramentas gratuitas da Guebly
          </p>

          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            {['Open source', 'Sem login', '100% gratuito'].map(tag => (
              <span key={tag}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {tools.map(tool => (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className={`group text-left p-6 rounded-2xl border transition-all duration-300 ${tool.glow}`}
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
            >
              {/* Icon + title */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${tool.color}`}>
                  {tool.icon}
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white">{tool.title}</h2>
                  <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {tool.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {tool.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {tool.tags.map(tag => (
                  <span key={tag}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.4)',
                    }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-bold"
                style={{ color: 'rgba(255,255,255,0.6)' }}>
                <span className="group-hover:text-white transition-colors">Abrir ferramenta</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <a href="https://www.guebly.com.br" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
            <img src="https://www.guebly.com.br/guebly.png" alt="Guebly"
              className="w-5 h-5 rounded object-contain opacity-40" />
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Open source · Sem login · 100% gratuito · by Guebly
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
