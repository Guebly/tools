import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import InstaPreview from './pages/InstaPreview'
import ZapTranscriber from './pages/ZapTranscriber'
import TextFormatter from './pages/TextFormatter'
import ReadmePdf from './pages/ReadmePdf'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/insta-preview" element={<InstaPreview />} />
        <Route path="/zap-transcriber" element={<ZapTranscriber />} />
        <Route path="/text-formatter" element={<TextFormatter />} />
        <Route path="/readme-pdf" element={<ReadmePdf />} />
      </Routes>
    </BrowserRouter>
  )
}
