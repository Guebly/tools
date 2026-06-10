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
      {/* 2px IG gradient accent line at very top */}
      <div
        style={{
          height: 2,
          background: 'linear-gradient(90deg, #f09433 0%, #e6683c 22%, #dc2743 45%, #cc2366 72%, #bc1888 100%)',
          flexShrink: 0,
        }}
      />

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-2.5 flex-shrink-0 z-50 border-b"
        style={{
          background: theme === 'dark' ? 'rgba(10,10,10,0.97)' : 'rgba(255,255,255,0.97)',
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Back link with logo */}
        <Link
          to="/"
          className="flex items-center gap-2 transition-opacity"
          style={{ opacity: 0.55, textDecoration: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.55' }}
        >
          <ArrowLeft size={13} strokeWidth={2.5} style={{ color: 'var(--text)' }} />
          <img
            src="/logo-64.png"
            alt="Guebly"
            width={20}
            height={20}
            className="rounded"
            style={{ objectFit: 'contain', opacity: 0.85 }}
          />
          <span
            className="text-sm font-semibold hidden sm:block"
            style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
          >
            Guebly Tools
          </span>
        </Link>

        {/* Tool name — pill badge style */}
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)',
            color: 'var(--text2)',
            letterSpacing: '0.01em',
          }}
        >
          {toolName}
        </span>

        {/* Theme toggle — slightly bigger */}
        <button
          onClick={toggle}
          className="flex items-center justify-center rounded-lg transition-all hover:opacity-100"
          style={{
            width: 36,
            height: 36,
            opacity: 0.55,
            background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
            color: 'var(--text)',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
          }}
          title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.55' }}
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
