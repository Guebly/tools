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
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 z-50 border-b"
        style={{
          background: 'rgba(10,10,10,0.97)',
          borderColor: 'rgba(255,255,255,0.08)',
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
          <ArrowLeft size={14} strokeWidth={2.5} className="text-white" />
          <img
            src="/logo-64.png"
            alt="Guebly"
            width={22}
            height={22}
            className="rounded-md"
            style={{ objectFit: 'contain' }}
          />
          <span className="text-sm font-semibold text-white hidden sm:block">
            Guebly Tools
          </span>
        </Link>

        {/* Tool name */}
        <span
          className="text-sm font-bold"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {toolName}
        </span>

        {/* Spacer simétrico */}
        <div className="w-28 hidden sm:block" />
        <div className="w-6 sm:hidden" />
      </div>

      {/* Content */}
      <div className={fullHeight ? 'flex-1 overflow-hidden' : 'flex-1'}>
        {children}
      </div>
    </div>
  )
}
