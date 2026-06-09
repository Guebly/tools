import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import React from 'react'

interface LayoutProps {
  toolName: string
  children: React.ReactNode
  fullHeight?: boolean
}

export default function Layout({ toolName, children, fullHeight = false }: LayoutProps) {
  return (
    <div className={fullHeight ? 'flex flex-col h-screen overflow-hidden' : 'min-h-screen flex flex-col'}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 z-50 border-b"
        style={{
          background: 'rgba(10,10,10,0.95)',
          borderColor: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
        >
          <ArrowLeft size={16} />
          <span>Guebly Tools</span>
        </Link>
        <span className="text-sm font-bold text-white opacity-70">{toolName}</span>
        <div className="w-24" />
      </div>

      {/* Content */}
      <div className={fullHeight ? 'flex-1 overflow-hidden' : 'flex-1'}>
        {children}
      </div>
    </div>
  )
}
