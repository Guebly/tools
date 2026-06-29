import { useMemo, useState } from 'react'
import { Type, Eraser } from 'lucide-react'
import Layout from '../components/Layout'

const ACCENT = '#f59e0b'

export default function WordCounter() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length
    const words = (text.trim().match(/\S+/g) || []).length
    const sentences = (text.match(/[^.!?…]+[.!?…]+/g) || []).length || (text.trim() ? 1 : 0)
    const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).length
    const lines = text ? text.split('\n').length : 0
    const readMin = words / 200   // leitura ~200 ppm
    const speakMin = words / 130  // fala ~130 ppm
    const fmt = (m: number) => {
      if (m < 1 / 60) return '0s'
      const totalSec = Math.round(m * 60)
      const mm = Math.floor(totalSec / 60), ss = totalSec % 60
      return mm ? `${mm}min ${ss}s` : `${ss}s`
    }
    return { chars, charsNoSpaces, words, sentences, paragraphs, lines, read: fmt(readMin), speak: fmt(speakMin) }
  }, [text])

  const cards: { label: string; value: string | number; hint?: string }[] = [
    { label: 'Palavras', value: stats.words },
    { label: 'Caracteres', value: stats.chars },
    { label: 'Sem espaços', value: stats.charsNoSpaces },
    { label: 'Frases', value: stats.sentences },
    { label: 'Parágrafos', value: stats.paragraphs },
    { label: 'Linhas', value: stats.lines },
    { label: 'Tempo de leitura', value: stats.read, hint: '~200 ppm' },
    { label: 'Tempo de fala', value: stats.speak, hint: '~130 ppm' },
  ]

  return (
    <Layout toolName="Contador de Palavras">
      <div className="max-w-4xl mx-auto px-5 py-7">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}1f` }}>
            <Type size={18} color={ACCENT} />
          </div>
          <h1 className="text-lg font-black" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Contador de Palavras</h1>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--text2)' }}>
          Estatísticas do seu texto em tempo real — ideal para posts, legendas e artigos.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {cards.map(c => (
            <div key={c.label} className="rounded-xl px-3.5 py-3" style={{ border: '1px solid var(--border)', background: 'var(--bg2)' }}>
              <div className="text-xl font-black tabular-nums" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>{c.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text2)' }}>{c.label}</div>
              {c.hint && <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text2)', opacity: 0.7 }}>{c.hint}</div>}
            </div>
          ))}
        </div>

        <div className="flex justify-end mb-2">
          <button className="btn" onClick={() => setText('')} disabled={!text}><Eraser size={13} /> Limpar</button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Cole ou escreva seu texto aqui…"
          className="w-full p-4 text-sm rounded-2xl outline-none resize-none"
          style={{ height: 300, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.7 }} />
      </div>
    </Layout>
  )
}
