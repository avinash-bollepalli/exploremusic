import { Link } from 'react-router-dom'
import './GenreCard.css'

export default function GenreCard({ genre, index = 0 }) {
  return (
    <Link
      to={`/genre/${genre.id}`}
      className="genre-card"
      id={`genre-card-${genre.id}`}
      style={{
        '--card-color': genre.color,
        '--card-gradient': genre.gradient,
        animationDelay: `${index * 60}ms`,
      }}
      aria-label={`Explore ${genre.name} music`}
    >
      {/* Glow background */}
      <div className="genre-card__glow" />

      {/* Top section */}
      <div className="genre-card__top">
        <span className="genre-card__emoji">{genre.emoji}</span>
        <div className="genre-card__badge">
          {genre.tags.slice(0, 2).map(tag => (
            <span key={tag} className="genre-card__tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="genre-card__content">
        <h2 className="genre-card__name">{genre.name}</h2>
        <p className="genre-card__description">{genre.description}</p>
      </div>

      {/* Footer */}
      <div className="genre-card__footer">
        <span className="genre-card__vibe">{genre.vibe}</span>
        <span className="genre-card__cta">
          Explore
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </div>

      {/* Bottom gradient bar */}
      <div className="genre-card__bar" />
    </Link>
  )
}
