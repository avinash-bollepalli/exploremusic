import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import GenrePage from './pages/GenrePage'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/genre/:genreId" element={<GenrePage />} />
          {/* Fallback — redirect unknown routes to home */}
          <Route path="*"             element={<Home />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
