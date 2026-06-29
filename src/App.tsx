import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Home from './pages/Home'

// Lazy-load: cada ferramenta vira um chunk próprio, carregado só quando aberta.
// Mantém a home leve e evita puxar o bundle pesado (Whisper/jsPDF) de cara.
const InstaPreview = lazy(() => import('./pages/InstaPreview'))
const ZapTranscriber = lazy(() => import('./pages/ZapTranscriber'))
const TextFormatter = lazy(() => import('./pages/TextFormatter'))
const ReadmePdf = lazy(() => import('./pages/ReadmePdf'))
const JsonFormatter = lazy(() => import('./pages/JsonFormatter'))
const PasswordGenerator = lazy(() => import('./pages/PasswordGenerator'))
const ColorStudio = lazy(() => import('./pages/ColorStudio'))
const Encoders = lazy(() => import('./pages/Encoders'))
const WordCounter = lazy(() => import('./pages/WordCounter'))
const QrCode = lazy(() => import('./pages/QrCode'))

function Loading() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '3px solid var(--border)', borderTopColor: '#dc2743',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/insta-preview" element={<InstaPreview />} />
          <Route path="/zap-transcriber" element={<ZapTranscriber />} />
          <Route path="/text-formatter" element={<TextFormatter />} />
          <Route path="/readme-pdf" element={<ReadmePdf />} />
          <Route path="/json-formatter" element={<JsonFormatter />} />
          <Route path="/password-generator" element={<PasswordGenerator />} />
          <Route path="/color-studio" element={<ColorStudio />} />
          <Route path="/encoders" element={<Encoders />} />
          <Route path="/word-counter" element={<WordCounter />} />
          <Route path="/qr-code" element={<QrCode />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
