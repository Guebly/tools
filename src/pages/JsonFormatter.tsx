import { useMemo, useState } from 'react'
import { Braces, Copy, Check, Eraser, Minimize2, AlignLeft, AlertCircle, Download } from 'lucide-react'
import Layout from '../components/Layout'

const ACCENT = '#10b981'
const SAMPLE = `{
  "produto": "Guebly Tools",
  "gratis": true,
  "ferramentas": ["JSON", "Senha", "Cor"],
  "stats": { "ferramentas": 10, "backend": null }
}`

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    const text = input.trim()
    if (!text) return { ok: true as const, out: '', error: '' }
    try {
      const parsed = JSON.parse(text)
      return { ok: true as const, out: JSON.stringify(parsed, null, indent), error: '' }
    } catch (e) {
      return { ok: false as const, out: '', error: e instanceof Error ? e.message : 'JSON inválido' }
    }
  }, [input, indent])

  const minify = () => {
    try { setInput(JSON.stringify(JSON.parse(input))) } catch { /* mostra erro abaixo */ }
  }
  const beautify = () => { if (result.ok && result.out) setInput(result.out) }

  const copy = async () => {
    if (!result.out) return
    await navigator.clipboard.writeText(result.out)
    setCopied(true); setTimeout(() => setCopied(false), 1600)
  }
  const download = () => {
    if (!result.out) return
    const url = URL.createObjectURL(new Blob([result.out], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url; a.download = 'formatado.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const bytes = new TextEncoder().encode(input).length
  const lines = input ? input.split('\n').length : 0

  return (
    <Layout toolName="JSON Formatter">
      <div className="max-w-5xl mx-auto px-5 py-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}1f` }}>
            <Braces size={18} color={ACCENT} />
          </div>
          <h1 className="text-lg font-black" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>JSON Formatter</h1>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--text2)' }}>
          Valide, formate e minifique JSON no navegador. Nada sai do seu computador.
        </p>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button className="btn" onClick={beautify} disabled={!result.ok || !result.out}><AlignLeft size={13} /> Formatar</button>
          <button className="btn" onClick={minify} disabled={!input.trim()}><Minimize2 size={13} /> Minificar</button>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--text2)' }}>Indentação</span>
            <select value={indent} onChange={e => setIndent(Number(e.target.value))}
              className="text-xs rounded-md px-2 py-1.5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              <option value={2}>2 espaços</option>
              <option value={4}>4 espaços</option>
              <option value={0}>Minificado</option>
            </select>
          </div>
          <button className="btn ml-auto" onClick={() => setInput(SAMPLE)}>Exemplo</button>
          <button className="btn" onClick={() => setInput('')} disabled={!input}><Eraser size={13} /> Limpar</button>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-3.5 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Entrada</span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text2)' }}>{lines} linhas · {bytes} B</span>
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)} spellCheck={false}
              placeholder="Cole seu JSON aqui…"
              className="w-full p-3.5 font-mono text-[13px] outline-none resize-none"
              style={{ height: 420, background: 'transparent', color: 'var(--text)', lineHeight: 1.6 }} />
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${result.ok ? 'var(--border)' : '#ef444466'}` }}>
            <div className="flex items-center justify-between px-3.5 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: result.ok ? ACCENT : '#ef4444' }}>
                {result.ok ? 'Saída válida' : 'Erro'}
              </span>
              <div className="flex items-center gap-1.5">
                <button className="btn" style={{ padding: '4px 10px' }} onClick={download} disabled={!result.out}><Download size={12} /></button>
                <button className="btn" style={{ padding: '4px 10px' }} onClick={copy} disabled={!result.out}>
                  {copied ? <><Check size={12} color={ACCENT} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                </button>
              </div>
            </div>
            {result.ok ? (
              <pre className="p-3.5 font-mono text-[13px] overflow-auto" style={{ height: 420, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                {result.out || <span style={{ color: 'var(--text2)' }}>O resultado formatado aparece aqui.</span>}
              </pre>
            ) : (
              <div className="p-4 flex items-start gap-2.5" style={{ height: 420 }}>
                <AlertCircle size={16} color="#ef4444" className="flex-shrink-0 mt-0.5" />
                <span className="text-[13px] font-mono" style={{ color: '#ef4444', lineHeight: 1.6 }}>{result.error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
