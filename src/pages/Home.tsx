import { useNavigate } from 'react-router-dom'
import React from 'react'

interface Tool {
  path: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  accent: string
  glowColor: string
  icon: React.ReactNode
}

const tools: Tool[] = [
  {
    path: '/insta-preview',
    title: 'InstaPreview',
    subtitle: 'Simulador de Feed',
    description: 'Simule e organize seu feed do Instagram com drag & drop. Exporte como PNG ou PDF de proposta.',
    tags: ['Drag & Drop', 'Templates', 'Export PDF'],
    accent: 'rgba(220,39,67,0.15)',
    glowColor: 'rgba(220,39,67,0.22)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
    accent: 'rgba(37,211,102,0.12)',
    glowColor: 'rgba(37,211,102,0.18)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2">
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
    accent: 'rgba(59,130,246,0.12)',
    glowColor: 'rgba(59,130,246,0.2)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
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
    accent: 'rgba(249,115,22,0.12)',
    glowColor: 'rgba(249,115,22,0.2)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
]

const BADGES = ['Open source', 'Sem login', '100% gratuito', 'Sem backend']

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: '#080808', color: '#ffffff' }}>

      {/* Grid de pontos de fundo */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Blobs de luz */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'rgba(220,39,67,0.05)' }} />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'rgba(59,130,246,0.04)' }} />
        <div className="absolute -bottom-48 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'rgba(37,211,102,0.03)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">

        {/* ── Header ── */}
        <div className="text-center mb-14">

          {/* Logo Guebly */}
          <a
            href="https://www.guebly.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-5 transition-transform hover:scale-105"
          >
            <img
              src="/logo-192.png"
              alt="Guebly"
              width={72}
              height={72}
              className="rounded-2xl shadow-lg"
              style={{ boxShadow: '0 0 40px rgba(220,39,67,0.2)' }}
            />
          </a>

          <h1
            className="text-4xl sm:text-5xl font-black mb-3"
            style={{ letterSpacing: '-0.04em', lineHeight: 1.1 }}
          >
            Guebly{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f09433 0%, #dc2743 50%, #bc1888 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Tools
            </span>
          </h1>

          <p className="text-base sm:text-lg mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Ferramentas gratuitas feitas pela Guebly
          </p>

          {/* Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {BADGES.map(b => (
              <span
                key={b}
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  border: '1px solid rgba(255,255,255,0.09)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {tools.map(tool => (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className="group text-left p-6 rounded-2xl border transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.025)',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = tool.accent
                el.style.borderColor = 'rgba(255,255,255,0.13)'
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = `0 16px 48px ${tool.glowColor}`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.025)'
                el.style.borderColor = 'rgba(255,255,255,0.07)'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Ícone + título */}
              <div className="flex items-center gap-3.5 mb-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  {tool.icon}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">{tool.title}</h2>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {tool.subtitle}
                  </p>
                </div>
              </div>

              {/* Descrição */}
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.52)' }}>
                {tool.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tool.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2 py-0.5 rounded-md"
                    style={{
                      background: 'rgba(255,255,255,0.055)',
                      color: 'rgba(255,255,255,0.38)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1.5">
                <span
                  className="text-xs font-bold transition-colors"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  Abrir ferramenta
                </span>
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.5)" strokeWidth="2.5"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-col items-center gap-3">
          <a
            href="https://github.com/Guebly/tools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Ver no GitHub
          </a>

          <a
            href="https://www.guebly.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <img
              src="/logo-64.png"
              alt="Guebly"
              width={16}
              height={16}
              className="rounded opacity-30"
            />
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>
              by Guebly — guebly.com.br
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
