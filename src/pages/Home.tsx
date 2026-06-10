import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, Globe, Lock, Github, Layers } from 'lucide-react'

interface Tool {
  path: string
  kbd: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  accent: string
  accentSoft: string
  accentGlow: string
  icon: React.ReactNode
}

const tools: Tool[] = [
  {
    path: '/insta-preview',
    kbd: '1',
    title: 'InstaPreview',
    subtitle: 'Simulador de Feed do Instagram',
    description: 'Simule e organize seu feed com drag & drop. Exporte como PNG ou PDF de proposta para clientes.',
    tags: ['Drag & Drop', 'PDF Export', 'Templates'],
    accent: '#dc2743',
    accentSoft: 'rgba(220,39,67,0.12)',
    accentGlow: '0 16px 48px rgba(220,39,67,0.22)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
    subtitle: 'Transcritor de Áudio IA',
    description: 'Transcreva áudios e vídeos do WhatsApp no navegador com Whisper AI. Sem servidor, 100% privado.',
    tags: ['Whisper AI', 'Sem Backend', 'SRT'],
    accent: '#25D366',
    accentSoft: 'rgba(37,211,102,0.10)',
    accentGlow: '0 16px 48px rgba(37,211,102,0.18)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2">
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
    subtitle: 'Formatador para Redes Sociais',
    description: 'Converta Markdown para LinkedIn, Instagram e WhatsApp sem perder a formatação na hora de postar.',
    tags: ['LinkedIn', 'Instagram', 'WhatsApp'],
    accent: '#4B8BFF',
    accentSoft: 'rgba(75,139,255,0.10)',
    accentGlow: '0 16px 48px rgba(75,139,255,0.18)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B8BFF" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h10"/>
        <path d="M17 15l2 2 4-4" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    path: '/readme-pdf',
    kbd: '4',
    title: 'README to PDF',
    subtitle: 'Markdown para PDF Profissional',
    description: 'Converta arquivos Markdown em PDFs com 3 temas premium. Live preview em tempo real, sem servidor.',
    tags: ['Markdown', '3 Temas', 'Live Preview'],
    accent: '#f97316',
    accentSoft: 'rgba(249,115,22,0.10)',
    accentGlow: '0 16px 48px rgba(249,115,22,0.18)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
]

const stats = [
  { icon: <Layers size={12} />, label: '4 ferramentas' },
  { icon: <Globe size={12} />,  label: '100% no navegador' },
  { icon: <Lock size={12} />,   label: 'Sem login' },
  { icon: <Github size={12} />, label: 'Open source' },
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
    bg:         isDark ? '#080808'                 : '#f5f6f8',
    text:       isDark ? '#ffffff'                 : '#0f172a',
    textSub:    isDark ? 'rgba(255,255,255,0.52)'  : 'rgba(15,23,42,0.62)',
    textMuted:  isDark ? 'rgba(255,255,255,0.25)'  : 'rgba(15,23,42,0.35)',
    dot:        isDark ? 'rgba(255,255,255,0.028)' : 'rgba(0,0,0,0.055)',
    navBorder:  isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.09)',
    navBg:      isDark ? 'rgba(8,8,8,0.93)'        : 'rgba(245,246,248,0.93)',
    pill:       isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.05)',
    pillBorder: isDark ? 'rgba(255,255,255,0.09)'  : 'rgba(0,0,0,0.09)',
    pillColor:  isDark ? 'rgba(255,255,255,0.42)'  : 'rgba(15,23,42,0.52)',
    cardBg:     isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.72)',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.09)',
    cardShadow: isDark ? '0 1px 4px rgba(0,0,0,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
    divider:    isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.07)',
  }

  return (
    <div className="min-h-screen" style={{ background: c.bg, color: c.text }}>

      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${c.dot} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[520px] h-[520px] rounded-full"
          style={{ background: isDark ? 'rgba(220,39,67,0.045)' : 'rgba(220,39,67,0.065)', filter: 'blur(130px)' }} />
        <div className="absolute top-1/2 -left-48 w-[420px] h-[420px] rounded-full"
          style={{ background: isDark ? 'rgba(75,139,255,0.04)' : 'rgba(37,99,235,0.05)', filter: 'blur(120px)' }} />
        <div className="absolute -bottom-48 right-1/4 w-[420px] h-[420px] rounded-full"
          style={{ background: isDark ? 'rgba(37,211,102,0.03)' : 'rgba(22,163,74,0.04)', filter: 'blur(130px)' }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-5 sm:px-7"
        style={{
          height: 52,
          background: c.navBg,
          borderBottom: `1px solid ${c.navBorder}`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
        {/* IG gradient top line */}
        <div className="absolute top-0 left-0 right-0"
          style={{ height: 2, background: 'linear-gradient(90deg, #f09433 0%, #e6683c 22%, #dc2743 45%, #cc2366 72%, #bc1888 100%)' }} />

        <a href="https://www.guebly.com.br" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 flex-shrink-0 transition-opacity hover:opacity-70">
          <img src="/logo-64.png" alt="Guebly" width={22} height={22} className="rounded-md" style={{ objectFit: 'contain' }} />
          <span className="text-sm font-bold hidden sm:block" style={{ color: c.text, letterSpacing: '-0.01em' }}>Guebly</span>
        </a>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full tracking-widest uppercase"
          style={{ background: c.pill, border: `1px solid ${c.pillBorder}`, color: c.pillColor }}>
          tools
        </span>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <a href="https://github.com/Guebly/tools" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ color: c.pillColor, opacity: 0.65 }}>
            <Github size={14} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <button onClick={toggle}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:opacity-100"
            style={{ background: c.pill, border: `1px solid ${c.pillBorder}`, color: c.pillColor, opacity: 0.72 }}
            title={isDark ? 'Modo claro' : 'Modo escuro'}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 pt-16 pb-20">

        {/* ── Hero ── */}
        <div className="text-center mb-12">

          {/* Logo with gradient ring */}
          <a href="https://www.guebly.com.br" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-[22px] mb-8 p-[2.5px] transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #f09433 0%, #dc2743 45%, #bc1888 100%)',
              boxShadow: isDark
                ? '0 0 48px rgba(220,39,67,0.28), 0 0 0 1px rgba(255,255,255,0.04)'
                : '0 0 48px rgba(220,39,67,0.18)',
            }}>
            <div className="rounded-[20px] overflow-hidden"
              style={{ background: isDark ? '#111' : '#fff', width: 84, height: 84 }}>
              <img src="/logo-192.png" alt="Guebly" width={84} height={84}
                className="block" style={{ objectFit: 'contain' }} />
            </div>
          </a>

          {/* Title */}
          <h1 className="text-4xl sm:text-[54px] font-black mb-4"
            style={{ letterSpacing: '-0.045em', lineHeight: 1.01, color: c.text }}>
            Guebly{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f09433 0%, #e6683c 22%, #dc2743 45%, #cc2366 72%, #bc1888 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Tools
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-sm sm:text-base max-w-sm mx-auto mb-10"
            style={{ color: c.textSub, lineHeight: 1.7 }}>
            Ferramentas para criadores e devs.
            Gratuitas, open-source e 100% no navegador.
          </p>

          {/* Stats bar */}
          <div className="inline-flex items-center rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${c.divider}`, background: c.pill }}>
            {stats.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="w-px self-stretch" style={{ background: c.divider }} />}
                <div className="flex items-center gap-1.5 px-4 py-2.5">
                  <span style={{ color: c.textMuted }}>{s.icon}</span>
                  <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: c.textSub }}>
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-black tracking-widest uppercase flex-shrink-0"
            style={{ color: c.textMuted }}>
            Ferramentas
          </span>
          <div className="flex-1 h-px" style={{ background: c.divider }} />
          <span className="text-[10px] font-mono flex-shrink-0" style={{ color: c.textMuted }}>
            pressione 1–4
          </span>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-14">
          {tools.map(tool => (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className="group relative text-left rounded-2xl transition-all duration-200"
              style={{
                background: c.cardBg,
                borderRight:  `1px solid ${c.cardBorder}`,
                borderBottom: `1px solid ${c.cardBorder}`,
                borderLeft:   `1px solid ${c.cardBorder}`,
                borderTop:    `2px solid ${tool.accent}`,
                padding: '20px 22px',
                overflow: 'hidden',
                boxShadow: c.cardShadow,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)'
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = tool.accentGlow
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = c.cardBg
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = c.cardShadow
              }}
            >
              {/* Decorative background number */}
              <span className="absolute select-none pointer-events-none font-black leading-none"
                style={{
                  bottom: -10, right: 14,
                  fontSize: 96,
                  color: tool.accent,
                  opacity: isDark ? 0.07 : 0.05,
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                }}>
                {tool.kbd}
              </span>

              {/* Keyboard badge — colored with tool accent */}
              <span
                className="absolute top-3.5 right-3.5 w-6 h-6 flex items-center justify-center rounded-lg text-[11px] font-bold"
                style={{
                  background: tool.accentSoft,
                  color: tool.accent,
                  fontFamily: 'ui-monospace, monospace',
                  border: `1px solid ${tool.accent}25`,
                }}>
                {tool.kbd}
              </span>

              {/* Icon + title */}
              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: tool.accentSoft }}>
                  {tool.icon}
                </div>
                <div className="pt-0.5 min-w-0">
                  <h2 className="text-sm font-bold leading-tight"
                    style={{ color: c.text, letterSpacing: '-0.01em' }}>
                    {tool.title}
                  </h2>
                  <p className="text-[11px] mt-0.5 font-medium" style={{ color: c.textSub }}>
                    {tool.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed mb-4" style={{ color: c.textSub }}>
                {tool.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tool.tags.map(tag => (
                  <span key={tag}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                    style={{ background: tool.accentSoft, color: tool.accent }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold" style={{ color: tool.accent }}>Abrir</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke={tool.accent} strokeWidth="2.5"
                  className="group-hover:translate-x-1 transition-transform duration-150">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-center gap-3 flex-wrap pt-6"
          style={{ borderTop: `1px solid ${c.divider}` }}>
          <img src="/logo-64.png" alt="Guebly" width={13} height={13}
            className="rounded" style={{ objectFit: 'contain', opacity: 0.28 }} />
          <span className="text-xs" style={{ color: c.textMuted }}>
            © {new Date().getFullYear()} Guebly · Open-source · Sem coleta de dados
          </span>
          <a href="https://www.guebly.com.br" target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold transition-opacity hover:opacity-100"
            style={{ color: c.textMuted, opacity: 0.55, textDecoration: 'none' }}>
            guebly.com.br ↗
          </a>
        </div>
      </div>
    </div>
  )
}
