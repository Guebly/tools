import { useMemo, useState } from 'react'
import { Binary, Copy, Check, ArrowRightLeft, Eraser } from 'lucide-react'
import Layout from '../components/Layout'

const ACCENT = '#06b6d4'

function b64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach(b => { bin += String.fromCharCode(b) })
  return btoa(bin)
}
function b64Decode(str: string): string {
  const bin = atob(str.trim())
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

type Mode = 'base64' | 'url'

export default function Encoders() {
  const [mode, setMode] = useState<Mode>('base64')
  const [decode, setDecode] = useState(false)
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    if (!input) return { ok: true as const, out: '' }
    try {
      if (mode === 'base64') return { ok: true as const, out: decode ? b64Decode(input) : b64Encode(input) }
      return { ok: true as const, out: decode ? decodeURIComponent(input) : encodeURIComponent(input) }
    } catch (e) {
      return { ok: false as const, out: e instanceof Error ? e.message : 'Entrada inválida' }
    }
  }, [input, mode, decode])

  const copy = async () => {
    if (!result.ok || !result.out) return
    await navigator.clipboard.writeText(result.out)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  const swap = () => { if (result.ok && result.out) { setInput(result.out); setDecode(d => !d) } }

  return (
    <Layout toolName="Encoders">
      <div className="max-w-3xl mx-auto px-5 py-7">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}1f` }}>
            <Binary size={18} color={ACCENT} />
          </div>
          <h1 className="text-lg font-black" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Encoders</h1>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--text2)' }}>
          Codifique e decodifique Base64 e URL (UTF-8). Tudo local, sem servidor.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex rounded-xl p-1" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            {(['base64', 'url'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors"
                style={{ background: mode === m ? ACCENT : 'transparent', color: mode === m ? '#fff' : 'var(--text2)' }}>
                {m === 'base64' ? 'Base64' : 'URL'}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl p-1" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            {([['Codificar', false], ['Decodificar', true]] as const).map(([label, val]) => (
              <button key={label} onClick={() => setDecode(val)}
                className="text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors"
                style={{ background: decode === val ? ACCENT : 'transparent', color: decode === val ? '#fff' : 'var(--text2)' }}>
                {label}
              </button>
            ))}
          </div>
          <button className="btn ml-auto" onClick={swap} disabled={!result.ok || !result.out} title="Usar saída como entrada e inverter">
            <ArrowRightLeft size={13} /> Inverter
          </button>
          <button className="btn" onClick={() => setInput('')} disabled={!input}><Eraser size={13} /></button>
        </div>

        {/* Input */}
        <div className="rounded-2xl overflow-hidden mb-3" style={{ border: '1px solid var(--border)' }}>
          <div className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)' }}>
            Entrada
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)} spellCheck={false}
            placeholder={decode ? 'Cole o texto codificado…' : 'Digite o texto…'}
            className="w-full p-3.5 font-mono text-[13px] outline-none resize-none"
            style={{ height: 160, background: 'transparent', color: 'var(--text)', lineHeight: 1.6 }} />
        </div>

        {/* Output */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${result.ok ? 'var(--border)' : '#ef444466'}` }}>
          <div className="flex items-center justify-between px-3.5 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: result.ok ? ACCENT : '#ef4444' }}>Saída</span>
            <button className="btn" style={{ padding: '4px 10px' }} onClick={copy} disabled={!result.ok || !result.out}>
              {copied ? <><Check size={12} color={ACCENT} /> Copiado</> : <><Copy size={12} /> Copiar</>}
            </button>
          </div>
          <pre className="p-3.5 font-mono text-[13px] overflow-auto whitespace-pre-wrap break-all"
            style={{ minHeight: 120, color: result.ok ? 'var(--text)' : '#ef4444', lineHeight: 1.6, margin: 0 }}>
            {result.out || <span style={{ color: 'var(--text2)' }}>O resultado aparece aqui.</span>}
          </pre>
        </div>
      </div>
    </Layout>
  )
}
