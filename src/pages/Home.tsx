import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

interface Tool {
  path: string
  kbd: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  accentDark: string
  accentLight: string
  glowDark: string
  glowLight: string
  borderDark: string
  borderLight: string
  icon: React.ReactNode
}

const tools: Tool[] = [
  {
    path: '/insta-preview',
    kbd: '1',
    title: 'InstaPreview',
    subtitle: 'Simulador de Feed',
    description: 'Simule e organize seu feed do Instagram com drag & drop. Exporte como PNG ou PDF de proposta.',
    tags: ['Drag & Drop', 'Templates', 'Export PDF'],
    accentDark: 'rgba(220,39,67,0.12)',
    accentLight: 'rgba(220,39,67,0.07)',
    glowDark: 'rgba(220,39,67,0.22)',
    glowLight: 'rgba(220,39,67,0.14)',
    borderDark: 'rgba(220,39,67,0.35)',
    borderLight: 'rgba(220,39,67,0.3)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
    kbd: '2',
    title: 'ZapTranscriber',
    subtitle: 'Transcritor de Áudio',
    description: 'Transcreva áudios e vídeos do WhatsApp diretamente no navegador. Whisper AI local, 100% privado.',
    tags: ['Whisper AI', 'Sem backend', 'SRT'],
    accentDark: 'rgba(37,211,102,0.10)',
    accentLight: 'rgba(37,211,102,0.07)',
    glowDark: 'rgba(37,211,102,0.20)',
    glowLight: 'rgba(37,211,102,0.12)',
    borderDark: 'rgba(37,211,102,0.35)',
    borderLight: 'rgba(22,163,74,0.3)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        <circle cx="9" cy="10" r="1" fill="#25D366"/>
        <circle cx="12" cy="10" r="1" fill="#25D366"/>
        <circle cx="15" cy="10" r="1" fill="#25D366"/>
      </svg>
    ),
  },
  {
    path: '/text-formatter',
    kbd: '3',
    title: 'Text Formatter',
    subtitle: 'Formatador de Texto',
    description: 'Converta Markdown para LinkedIn, Instagram e WhatsApp. Sem perder a formatação na hora de postar.',
    tags: ['LinkedIn', 'Instagram', 'WhatsApp'],
    accentDark: 'rgba(75,139,255,0.10)',
    accentLight: 'rgba(37,99,235,0.07)',
    glowDark: 'rgba(75,139,255,0.20)',
    glowLight: 'rgba(37,99,235,0.14)',
    borderDark: 'rgba(75,139,255,0.35)',
    borderLight: 'rgba(37,99,235,0.3)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4B8BFF" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h10"/>
        <path d="M17 15l2 2 4-4" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    path: '/readme-pdf',
    kbd: '4',
    title: 'README to PDF',
    subtitle: 'README para PDF',
    description: 'Converta arquivos Markdown em PDFs profissionais com 3 temas. Live preview, sem servidor.',
    tags: ['Markdown', '3 Temas', 'Live Preview'],
    accentDark: 'rgba(249,115,22,0.10)',
    accentLight: 'rgba(234,88,12,0.07)',
    glowDark: 'rgba(249,115,22,0.20)',
    glowLight: 'rgba(234,88,12,0.14)',
    borderDark: 'rgba(249,115,22,0.35)',
    borderLight: 'rgba(234,88,12,0.3)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
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
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const map: Record<string, string> = {
        '1': '/insta-preview', '2': '/zap-transcriber',
        '3': '/text-formatter', '4': '/readme-pdf',
      }
      if (map[e.key]) navigate(map[e.key])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  const c = {
    bg:           isDark ? '#080808'                     : '#f5f6f8',
    text:         isDark ? '#ffffff'                     : '#0f172a',
    textSub:      isDark ? 'rgba(255,255,255,0.45)'      : 'rgba(15,23,42,0.55)',
    textMuted:    isDark ? 'rgba(255,255,255,0.25)'      : 'rgba(15,23,42,0.35)',
    dot:          isDark ? 'rgba(255,255,255,0.028)'     : 'rgba(0,0,0,0.055)',
    navBorder:    isDark ? 'rgba(255,255,255,0.06)'      : 'rgba(0,0,0,0.08)',
    navBg:        isDark ? 'rgba(8,8,8,0.92)'            : 'rgba(245,246,248,0.92)',
    badgeBg:      isDark ? 'rgba(255,255,255,0.05)'      : 'rgba(0,0,0,0.05)',
    badgeBorder:  isDark ? 'rgba(255,255,255,0.08)'      : 'rgba(0,0,0,0.09)',
    badgeColor:   isDark ? 'rgba(255,255,255,0.38)'      : 'rgba(15,23,42,0.45)',
    cardBg:       isDark ? 'rgba(255,255,255,0.025)'     : 'rgba(0,0,0,0.03)',
    cardBorder:   isDark ? 'rgba(255,255,255,0.07)'      : 'rgba(0,0,0,0.08)',
    iconBg:       isDark ? 'rgba(255,255,255,0.06)'      : 'rgba(0,0,0,0.05)',
    tagBg:        isDark ? 'rgba(255,255,255,0.05)'      : 'rgba(0,0,0,0.05)',
    tagColor:     isDark ? 'rgba(255,255,255,0.3)'       : 'rgba(15,23,42,0.4)',
    ctaColor:     isDark ? 'rgba(255,255,255,0.38)'      : 'rgba(15,23,42,0.45)',
    footerBorder: isDark ? 'rgba(255,255,255,0.06)'      : 'rgba(0,0,0,0.07)',
    toggleBg:     isDark ? 'rgba(255,255,255,0.07)'      : 'rgba(0,0,0,0.06)',
    toggleBorder: isDark ? 'rgba(255,255,255,0.09)'      : 'rgba(0,0,0,0.08)',
    toggleColor:  isDark ? 'rgba(255,255,255,0.55)'      : 'rgba(15,23,42,0.55)',
  }

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: c.bg, color: c.text }}>

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${c.dot} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[480px] h-[480px] rounded-full"
          style={{ background: isDark ? 'rgba(220,39,67,0.04)' : 'rgba(220,39,67,0.06)', filter: 'blur(120px)' }} />
        <div className="absolute top-1/2 -left-48 w-[380px] h-[380px] rounded-full"
          style={{ background: isDark ? 'rgba(75,139,255,0.04)' : 'rgba(37,99,235,0.05)', filter: 'blur(100px)' }} />
        <div className="absolute -bottom-48 right-1/4 w-[380px] h-[380px] rounded-full"
          style={{ background: isDark ? 'rgba(37,211,102,0.03)' : 'rgba(22,163,74,0.04)', filter: 'blur(120px)' }} />
      </div>

      {/* ── Navbar ── */}
      <nav
        className="relative z-20 flex items-center justify-between px-5 sm:px-7 py-3.5"
        style={{
          background: c.navBg,
          borderBottom: `1px solid ${c.navBorder}`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Logo */}
        <a href="https://www.guebly.com.br" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-75">
          <img src="/logo-64.png" alt="Guebly" width={22} height={22} className="rounded-md" style={{ objectFit: 'contain' }} />
          <span className="text-sm font-bold hidden sm:block" style={{ color: c.text, letterSpacing: '-0.01em' }}>
            Guebly
          </span>
        </a>

        {/* Center badge */}
        <span className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: c.badgeBg, border: `1px solid ${c.badgeBorder}`, color: c.badgeColor, letterSpacing: '0.04em' }}>
          tools
        </span>

        {/* Right: GitHub + theme toggle */}
        <div className="flex items-center gap-3">
          <a href="https://github.com/Guebly/tools" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-75"
            style={{ color: c.ctaColor }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <button onClick={toggle}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-opacity hover:opacity-100"
            style={{ background: c.toggleBg, border: `1px solid ${c.toggleBorder}`, color: c.toggleColor, opacity: 0.7 }}
            title={isDark ? 'Modo claro' : 'Modo escuro'}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 pt-14 pb-20">

        {/* Hero */}
        <div className="text-center mb-14">
          <a href="https://www.guebly.com.br" target="_blank" rel="noopener noreferrer"
            className="inline-block mb-6 transition-transform hover:scale-105">
            <img src="/logo-192.png" alt="Guebly" width={76} height={76} className="rounded-2xl"
              style={{ boxShadow: isDark
                ? '0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(220,39,67,0.18)'
                : '0 0 0 1px rgba(0,0,0,0.08), 0 20px 60px rgba(220,39,67,0.14)' }} />
          </a>

          <h1 className="text-4xl sm:text-5xl font-black mb-3"
            style={{ letterSpacing: '-0.04em', lineHeight: 1.05, color: c.text }}>
            Guebly{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f09433 0%, #dc2743 50%, #bc1888 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Tools
            </span>
          </h1>

          <p className="text-sm sm:text-base mb-7 max-w-sm mx-auto" style={{ color: c.textSub, lineHeight: 1.65 }}>
            Ferramentas gratuitas para criadores de conteúdo e devs.
          </p>

          {/* Stat pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['4 ferramentas', '100% no navegador', 'Sem login', 'Open source'].map(s => (
              <span key={s} className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ border: `1px solid ${c.badgeBorder}`, background: c.badgeBg, color: c.badgeColor }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-14">
          {tools.map(tool => (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className="group relative text-left rounded-2xl transition-all duration-200"
              style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, padding: '20px 22px' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = isDark ? tool.accentDark : tool.accentLight
                el.style.borderColor = isDark ? tool.borderDark : tool.borderLight
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = `0 12px 40px ${isDark ? tool.glowDark : tool.glowLight}`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = c.cardBg
                el.style.borderColor = c.cardBorder
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Keyboard badge */}
              <span className="absolute top-3 right-3 kbd" style={{ opacity: 0.45 }}>
                {tool.kbd}
              </span>

              {/* Icon + title */}
              <div className="flex items-start gap-3.5 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: c.iconBg }}>
                  {tool.icon}
                </div>
                <div className="pt-0.5">
                  <h2 className="text-sm font-bold leading-tight" style={{ color: c.text, letterSpacing: '-0.01em' }}>
                    {tool.title}
                  </h2>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: c.textSub }}>
                    {tool.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed mb-3" style={{ color: c.textSub }}>
                {tool.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3.5">
                {tool.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                    style={{ background: c.tagBg, color: c.tagColor }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold" style={{ color: c.ctaColor }}>Abrir</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke={c.ctaColor} strokeWidth="2.5"
                  className="group-hover:translate-x-1 transition-transform duration-150">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 pt-6"
          style={{ borderTop: `1px solid ${c.footerBorder}` }}>
          <img src="/logo-64.png" alt="Guebly" width={13} height={13}
            className="rounded" style={{ objectFit: 'contain', opacity: 0.3 }} />
          <span className="text-xs" style={{ color: c.textMuted }}>by Guebly</span>
        </div>
      </div>
    </div>
  )
}
