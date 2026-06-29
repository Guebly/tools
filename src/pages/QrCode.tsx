import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { QrCode as QrIcon, Download, Eraser } from 'lucide-react'
import Layout from '../components/Layout'

const ACCENT = '#6366f1'

export default function QrCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [text, setText] = useState('https://tools.guebly.com.br')
  const [size, setSize] = useState(320)
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [error, setError] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!text.trim()) { const ctx = canvas.getContext('2d'); ctx?.clearRect(0, 0, canvas.width, canvas.height); setError(''); return }
    QRCode.toCanvas(canvas, text, {
      width: size, margin: 2, errorCorrectionLevel: 'M',
      color: { dark: fg, light: bg },
    }).then(() => setError('')).catch(e => setError(e instanceof Error ? e.message : 'Erro ao gerar QR'))
  }, [text, size, fg, bg])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'qrcode.png'
    a.click()
  }

  return (
    <Layout toolName="QR Code">
      <div className="max-w-3xl mx-auto px-5 py-7">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}1f` }}>
            <QrIcon size={18} color={ACCENT} />
          </div>
          <h1 className="text-lg font-black" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Gerador de QR Code</h1>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--text2)' }}>
          Gere QR Codes de qualquer texto ou link e baixe em PNG. Gerado no navegador.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Controls */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text2)' }}>Conteúdo</label>
              <textarea value={text} onChange={e => setText(e.target.value)} spellCheck={false}
                placeholder="URL, texto, Wi-Fi, PIX…"
                className="w-full p-3 text-sm rounded-xl outline-none resize-none font-mono"
                style={{ height: 110, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.5 }} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Tamanho</label>
                <span className="text-xs font-bold font-mono" style={{ color: ACCENT }}>{size}px</span>
              </div>
              <input type="range" min={120} max={640} step={20} value={size} onChange={e => setSize(Number(e.target.value))}
                className="w-full" style={{ accentColor: ACCENT }} />
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text2)' }}>
                Cor <input type="color" value={fg} onChange={e => setFg(e.target.value)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }} />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text2)' }}>
                Fundo <input type="color" value={bg} onChange={e => setBg(e.target.value)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }} />
              </label>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={download} disabled={!text.trim()} style={{ borderColor: ACCENT, color: ACCENT }}>
                <Download size={13} /> Baixar PNG
              </button>
              <button className="btn" onClick={() => setText('')} disabled={!text}><Eraser size={13} /> Limpar</button>
            </div>
            {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          </div>

          {/* Preview */}
          <div className="rounded-2xl flex items-center justify-center p-4" style={{ border: '1px solid var(--border)', background: 'var(--bg2)', minHeight: 280 }}>
            <canvas ref={canvasRef} className="rounded-lg max-w-full" style={{ display: text.trim() ? 'block' : 'none' }} />
            {!text.trim() && <span className="text-xs" style={{ color: 'var(--text2)' }}>Digite algo para gerar o QR.</span>}
          </div>
        </div>
      </div>
    </Layout>
  )
}
