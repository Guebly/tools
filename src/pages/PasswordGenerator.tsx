import { useCallback, useEffect, useState } from 'react'
import { KeyRound, Copy, Check, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'

const ACCENT = '#8b5cf6'
const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
}
const AMBIGUOUS = /[Il1O0o]/g

function secureShuffle(arr: string[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true, noAmbiguous: false })
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    let pool = ''
    const required: string[] = []
    ;(['lower', 'upper', 'digits', 'symbols'] as const).forEach(k => {
      if (opts[k]) {
        let set = SETS[k]
        if (opts.noAmbiguous) set = set.replace(AMBIGUOUS, '')
        pool += set
        required.push(set[crypto.getRandomValues(new Uint32Array(1))[0] % set.length])
      }
    })
    if (!pool) { setPassword(''); return }
    const out = [...required]
    const rnd = crypto.getRandomValues(new Uint32Array(Math.max(length - out.length, 0)))
    for (let i = 0; i < length - required.length; i++) out.push(pool[rnd[i] % pool.length])
    setPassword(secureShuffle(out).slice(0, length).join(''))
  }, [length, opts])

  useEffect(() => { generate() }, [generate])

  // Estimativa de entropia (bits) = comprimento * log2(tamanho do pool)
  const poolSize = (['lower', 'upper', 'digits', 'symbols'] as const).reduce((n, k) => {
    if (!opts[k]) return n
    return n + (opts.noAmbiguous ? SETS[k].replace(AMBIGUOUS, '').length : SETS[k].length)
  }, 0)
  const entropy = poolSize ? Math.round(length * Math.log2(poolSize)) : 0
  const strength = entropy >= 100 ? { label: 'Excelente', color: '#10b981', pct: 100 }
    : entropy >= 70 ? { label: 'Forte', color: '#22c55e', pct: 80 }
    : entropy >= 45 ? { label: 'Razoável', color: '#f59e0b', pct: 55 }
    : { label: 'Fraca', color: '#ef4444', pct: 30 }

  const copy = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true); setTimeout(() => setCopied(false), 1600)
  }

  const toggle = (k: keyof typeof opts) => setOpts(o => ({ ...o, [k]: !o[k] }))

  return (
    <Layout toolName="Gerador de Senhas">
      <div className="max-w-2xl mx-auto px-5 py-7">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}1f` }}>
            <KeyRound size={18} color={ACCENT} />
          </div>
          <h1 className="text-lg font-black" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Gerador de Senhas</h1>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--text2)' }}>
          Senhas fortes geradas com <code style={{ color: ACCENT }}>crypto.getRandomValues</code> — aleatoriedade real, nada sai do navegador.
        </p>

        {/* Output */}
        <div className="rounded-2xl p-4 mb-3 flex items-center gap-3" style={{ border: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <code className="flex-1 font-mono text-base sm:text-lg break-all" style={{ color: 'var(--text)', letterSpacing: '0.02em' }}>
            {password || '—'}
          </code>
          <button className="btn" onClick={generate} title="Gerar outra"><RefreshCw size={14} /></button>
          <button className="btn" onClick={copy} style={{ borderColor: ACCENT, color: ACCENT }}>
            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
          </button>
        </div>

        {/* Strength */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div style={{ width: `${strength.pct}%`, height: '100%', background: strength.color, transition: 'width .3s' }} />
          </div>
          <span className="text-xs font-bold" style={{ color: strength.color }}>{strength.label}</span>
          <span className="text-[11px] font-mono" style={{ color: 'var(--text2)' }}>~{entropy} bits</span>
        </div>

        {/* Length */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Comprimento</span>
            <span className="text-sm font-bold font-mono" style={{ color: ACCENT }}>{length}</span>
          </div>
          <input type="range" min={6} max={64} value={length} onChange={e => setLength(Number(e.target.value))}
            className="w-full" style={{ accentColor: ACCENT }} />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {([
            ['upper', 'Maiúsculas (A-Z)'], ['lower', 'Minúsculas (a-z)'],
            ['digits', 'Números (0-9)'], ['symbols', 'Símbolos (!@#$)'],
            ['noAmbiguous', 'Excluir ambíguos (I l 1 O 0)'],
          ] as const).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-pointer"
              style={{ border: `1px solid ${opts[k] ? `${ACCENT}55` : 'var(--border)'}`, background: opts[k] ? `${ACCENT}12` : 'transparent' }}>
              <input type="checkbox" checked={opts[k]} onChange={() => toggle(k)} style={{ accentColor: ACCENT, width: 16, height: 16 }} />
              <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </Layout>
  )
}
