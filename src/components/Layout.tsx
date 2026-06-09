import { Link } from 'react-router-dom'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface LayoutProps {
  toolName: string
  children: React.ReactNode
  fullHeight?: boolean
}

export default function Layout({ toolName, children, fullHeight = false }: LayoutProps) {
  const { theme, toggle } = useTheme()

  return (
    <div className={fullHeight ? 'flex flex-col h-screen overflow-hidden' : 'min-h-screen flex flex-col'}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 z-50 border-b"
        style={{
          background: theme === 'dark' ? 'rgba(10,10,10,0.97)' : 'rgba(255,255,255,0.97)',
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Back link com logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-100"
          style={{ opacity: 0.6 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6' }}
        >
          <ArrowLeft size={14} strokeWidth={2.5} style={{ color: 'var(--text)' }} />
          <img
            src="/logo-64.png"
            alt="Guebly"
            width={22}
            height={22}
            className="rounded-md"
            style={{ objectFit: 'contain' }}
          />
          <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--text)' }}>
            Guebly Tools
          </span>
        </Link>

        {/* Tool name */}
        <span
          className="text-sm font-bold"
          style={{ color: 'var(--text2)' }}
        >
          {toolName}
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-opacity hover:opacity-100"
          style={{ opacity: 0.5, background: 'rgba(128,128,128,0.1)', color: 'var(--text)' }}
          title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Content */}
      <div className={fullHeight ? 'flex-1 overflow-hidden' : 'flex-1'}>
        {children}
      </div>
    </div>
  )
}
