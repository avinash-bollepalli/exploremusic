import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getGenresInRange } from '../utils/bpm'
import BpmGenreBadge from '../components/BpmGenreBadge'
import './BpmRangePage.css'

export default function BpmRangePage() {
  const { range }  = useParams()
  const navigate    = useNavigate()
  const parsed      = range.split('-').map(Number)
  const isValid     = parsed.length === 2 && !parsed.some(Number.isNaN)
  const matches     = isValid ? getGenresInRange(parsed) : []

  // Redirect if the range is malformed or matches nothing
  useEffect(() => {
    if (matches.length === 0) navigate('/', { replace: true })
  }, [matches.length, navigate])

  if (matches.length === 0) return null

  const [low, high] = parsed

  return (
    <div className="bpm-page page-enter">

      {/* Hero banner */}
      <div className="bpm-hero">
        <div className="bpm-hero__bg" />
        <div className="container bpm-hero__inner">
          <Link to="/" className="bpm-hero__back" id="back-to-home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Genres
          </Link>
          <h1 className="bpm-hero__title">{low}–{high} BPM</h1>
          <p className="bpm-hero__subtitle">Genres that share this tempo range</p>
        </div>
      </div>

      {/* Matching genres */}
      <section className="bpm-matches" aria-label="Genres in this BPM range">
        <div className="container">
          <div className="bpm-matches__grid" role="list">
            {matches.map((g) => (
              <div key={g.id} role="listitem">
                <BpmGenreBadge genre={g} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
