import { useMemo, useState } from 'react'
import { Palette, Copy, Check } from 'lucide-react'
import Layout from '../components/Layout'

const ACCENT = '#ec4899'

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i) || hex.replace('#', '').match(/^([0-9a-f]{3})$/i)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0; const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    h /= 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}
const mix = (rgb: [number, number, number], target: number, amt: number): [number, number, number] =>
  rgb.map(c => c + (target - c) * amt) as [number, number, number]

function Swatch({ hex, onCopy }: { hex: string; onCopy: (v: string) => void }) {
  return (
    <button onClick={() => onCopy(hex)} className="group relative flex-1 rounded-lg overflow-hidden transition-transform hover:scale-105"
      style={{ height: 52, background: hex, border: '1px solid var(--border)' }} title={`Copiar ${hex}`}>
      <span className="absolute inset-x-0 bottom-0 text-[9px] font-mono font-bold py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>{hex}</span>
    </button>
  )
}

export default function ColorStudio() {
  const [hex, setHex] = useState('#7c3aed')
  const [copied, setCopied] = useState('')

  const rgb = useMemo(() => hexToRgb(hex), [hex])
  const data = useMemo(() => {
    if (!rgb) return null
    const [r, g, b] = rgb
    const [h, s, l] = rgbToHsl(r, g, b)
    const shades = [0.85, 0.65, 0.45, 0.25].map(a => toHex(...mix(rgb, 0, a)))
    const tints = [0.25, 0.45, 0.65, 0.85].map(a => toHex(...mix(rgb, 255, a)))
    return {
      rgbStr: `rgb(${r}, ${g}, ${b})`,
      hslStr: `hsl(${h}, ${s}%, ${l}%)`,
      palette: [...shades.reverse(), hex, ...tints],
    }
  }, [rgb, hex])

  const copy = async (v: string) => { await navigator.clipboard.writeText(v); setCopied(v); setTimeout(() => setCopied(''), 1400) }

  const Field = ({ label, value }: { label: string; value: string }) => (
    <button onClick={() => copy(value)} className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl transition-colors"
      style={{ border: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>{label}</span>
      <span className="flex items-center gap-2 font-mono text-[13px]" style={{ color: 'var(--text)' }}>
        {value}{copied === value ? <Check size={13} color="#10b981" /> : <Copy size={13} style={{ opacity: 0.4 }} />}
      </span>
    </button>
  )

  return (
    <Layout toolName="Color Studio">
      <div className="max-w-3xl mx-auto px-5 py-7">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}1f` }}>
            <Palette size={18} color={ACCENT} />
          </div>
          <h1 className="text-lg font-black" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Color Studio</h1>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--text2)' }}>
          Converta entre HEX, RGB e HSL e gere a paleta de tons/sombras. Clique para copiar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Picker */}
          <div className="rounded-2xl p-4 flex flex-col items-center justify-center gap-3" style={{ border: '1px solid var(--border)', background: 'var(--bg2)' }}>
            <div className="rounded-2xl" style={{ width: 120, height: 120, background: rgb ? hex : 'var(--border)', border: '1px solid var(--border)', boxShadow: rgb ? `0 12px 36px ${hex}55` : 'none' }} />
            <div className="flex items-center gap-2">
              <input type="color" value={rgb ? hex : '#000000'} onChange={e => setHex(e.target.value)}
                style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer' }} />
              <input value={hex} onChange={e => setHex(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)}
                spellCheck={false} maxLength={7}
                className="font-mono text-sm rounded-lg px-3 py-2 w-28 outline-none"
                style={{ background: 'var(--bg)', border: `1px solid ${rgb ? 'var(--border)' : '#ef4444'}`, color: 'var(--text)' }} />
            </div>
          </div>

          {/* Values */}
          <div className="flex flex-col gap-2 justify-center">
            <Field label="HEX" value={hex.toLowerCase()} />
            {data && <Field label="RGB" value={data.rgbStr} />}
            {data && <Field label="HSL" value={data.hslStr} />}
          </div>
        </div>

        {data && (
          <>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text2)' }}>Paleta (sombras → base → tons)</p>
            <div className="flex gap-1.5 mb-3">
              {data.palette.map((c, i) => <Swatch key={i} hex={c} onCopy={copy} />)}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
