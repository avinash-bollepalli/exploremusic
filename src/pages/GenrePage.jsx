import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { genres } from '../data/genres'
import { getArtistsByGenre } from '../services/spotify'
import ArtistCard from '../components/ArtistCard'
import './GenrePage.css'

export default function GenrePage() {
  const { genreId }           = useParams()
  const navigate              = useNavigate()
  const genre                 = genres.find(g => g.id === genreId)
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Redirect if genre not found
  useEffect(() => {
    if (!genre) navigate('/', { replace: true })
  }, [genre, navigate])

  // Fetch artists from Spotify
  useEffect(() => {
    if (!genre) return
    setLoading(true)
    setError(null)
    getArtistsByGenre(genre.spotifyGenre, 12)
      .then(data => {
        setArtists(data.filter(a => a.images?.length > 0))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Could not load artists. Check your Spotify API credentials in .env')
        setLoading(false)
      })
  }, [genre])

  if (!genre) return null

  // Related genres (adjacent in list, by genre index)
  const currentIdx   = genres.findIndex(g => g.id === genreId)
  const relatedGenres = [
    genres[(currentIdx - 1 + genres.length) % genres.length],
    genres[(currentIdx + 1) % genres.length],
    genres[(currentIdx + 2) % genres.length],
  ].filter(g => g.id !== genreId)

  return (
    <div className="genre-page page-enter">

      {/* Hero banner */}
      <div
        className="genre-hero"
        style={{ '--hero-gradient': genre.gradient, '--hero-color': genre.color }}
      >
        <div className="genre-hero__bg" />
        <div className="container genre-hero__inner">
          <Link to="/" className="genre-hero__back" id="back-to-home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            All Genres
          </Link>
          <div className="genre-hero__emoji">{genre.emoji}</div>
          <h1 className="genre-hero__name">{genre.name}</h1>
          <p className="genre-hero__desc">{genre.description}</p>
          <div className="genre-hero__meta">
            <span className="genre-hero__vibe">{genre.vibe}</span>
            <div className="genre-hero__tags">
              {genre.tags.map(tag => (
                <span key={tag} className="pill genre-hero__tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Artists section */}
      <section className="genre-artists" aria-label={`${genre.name} artists`}>
        <div className="container">
          <div className="genre-artists__header">
            <h2 className="genre-artists__title">
              Top <span style={{ color: genre.color }}>{genre.name}</span> Artists
            </h2>
            <p className="genre-artists__subtitle">Live data from Spotify · Click any artist to open their profile</p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="genre-artists__grid" aria-label="Loading artists">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="artist-skeleton">
                  <div className="skeleton artist-skeleton__avatar" />
                  <div className="skeleton artist-skeleton__name" />
                  <div className="skeleton artist-skeleton__sub" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="genre-artists__error" role="alert">
              <span className="genre-artists__error-icon">⚠️</span>
              <p>{error}</p>
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="genre-artists__error-link"
              >
                Get Spotify API Credentials →
              </a>
            </div>
          )}

          {/* Artist grid */}
          {!loading && !error && (
            <>
              {artists.length > 0 ? (
                <div className="genre-artists__grid" role="list">
                  {artists.map((artist, i) => (
                    <div key={artist.id} role="listitem">
                      <ArtistCard artist={artist} index={i} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="genre-artists__empty">
                  <p>No artists found for this genre on Spotify.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Related genres */}
      <section className="related-genres" aria-label="Related genres">
        <div className="container">
          <h2 className="related-genres__title">Explore More Genres</h2>
          <div className="related-genres__grid">
            {relatedGenres.map(g => (
              <Link
                key={g.id}
                to={`/genre/${g.id}`}
                className="related-genre-card"
                id={`related-genre-${g.id}`}
                style={{ '--rel-color': g.color, '--rel-gradient': g.gradient }}
              >
                <span className="related-genre-card__emoji">{g.emoji}</span>
                <span className="related-genre-card__name">{g.name}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="related-genre-card__arrow">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
