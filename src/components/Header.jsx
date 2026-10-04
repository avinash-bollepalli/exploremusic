import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { genres } from '../data/genres'
import './Header.css'

export default function Header() {
  const [scrolled, setScrolled]   = useState(false)
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState([])
  const [showDrop, setShowDrop]   = useState(false)
  const searchRef                 = useRef(null)
  const navigate                  = useNavigate()

  // Compact nav on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Live genre search
  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowDrop(false); return }
    const filtered = genres.filter(g =>
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      g.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    )
    setResults(filtered.slice(0, 5))
    setShowDrop(true)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (genreId) => {
    setQuery('')
    setShowDrop(false)
    navigate(`/genre/${genreId}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (results.length > 0) handleSelect(results[0].id)
  }

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">

        {/* Logo */}
        <Link to="/" className="header__logo" id="header-logo">
          <span className="header__logo-icon">🎵</span>
          <span className="header__logo-text">
            explore<span className="gradient-text">new</span>music
          </span>
        </Link>

        {/* Search */}
        <div className="header__search-wrap" ref={searchRef}>
          <form onSubmit={handleSubmit} className="header__search-form" id="header-search-form">
            <svg className="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="header-search-input"
              type="text"
              className="header__search-input"
              placeholder="Search genres, vibes, or tags…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => query && setShowDrop(true)}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className="header__search-clear"
                onClick={() => { setQuery(''); setShowDrop(false) }}
                aria-label="Clear search"
              >✕</button>
            )}
          </form>

          {showDrop && results.length > 0 && (
            <div className="header__search-dropdown" role="listbox" id="header-search-dropdown">
              {results.map(g => (
                <button
                  key={g.id}
                  className="header__search-result"
                  onClick={() => handleSelect(g.id)}
                  role="option"
                >
                  <span className="header__search-emoji">{g.emoji}</span>
                  <span>
                    <strong>{g.name}</strong>
                    <small>{g.tags.join(' · ')}</small>
                  </span>
                  <span className="header__search-arrow">→</span>
                </button>
              ))}
            </div>
          )}

          {showDrop && results.length === 0 && query && (
            <div className="header__search-dropdown header__search-dropdown--empty">
              No genres found for "<strong>{query}</strong>"
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="header__nav" aria-label="Main navigation">
          <Link to="/" className="header__nav-link" id="nav-home">Home</Link>
          <a
            href="https://developer.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="header__nav-link"
            id="nav-spotify"
          >
            <span>Powered by Spotify</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="header__spotify-icon">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </a>
        </nav>
      </div>
    </header>
  )
}
