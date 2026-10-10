import { genres } from '../data/genres'
import GenreCard from '../components/GenreCard'
import EtchedAccretion from '../components/EtchedAccretion'
import './Home.css'

export default function Home() {
  return (
    <div className="home page-enter">
      {/* Hero */}
      <EtchedAccretion className="hero" preset="glacier" aria-label="Hero section">
        <div className="container hero__inner">
          <h1 className="hero__title">
            Discover the <span className="gradient-text">Sound</span><br/>
            of Every World
          </h1>
          <p className="hero__subtitle">
            Pulled in by rhythm, not gravity — dive into {genres.length} curated genres
            and meet the artists orbiting each one.
          </p>
          <a href="#genres" className="hero__cta" id="hero-cta">
            Start Exploring
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </a>
        </div>
      </EtchedAccretion>

      {/* Genre Grid */}
      <section className="genres-section" id="genres" aria-label="Music genres">
        <div className="container">
          <div className="genres-section__header">
            <h2 className="genres-section__title">
              Explore by <span className="gradient-text">Genre</span>
            </h2>
            <p className="genres-section__subtitle">
              Click any genre to discover its top artists from Spotify
            </p>
          </div>
          <div className="genre-grid" role="list">
            {genres.map((genre, i) => (
              <div key={genre.id} role="listitem">
                <GenreCard genre={genre} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer__inner">
          <span className="footer__logo">🎵 explorenewmusic</span>
          <p className="footer__copy">
            Music data provided by{' '}
            <a href="https://spotify.com" target="_blank" rel="noopener noreferrer">Spotify</a>.
            Built with React + Vite.
          </p>
        </div>
      </footer>
    </div>
  )
}
