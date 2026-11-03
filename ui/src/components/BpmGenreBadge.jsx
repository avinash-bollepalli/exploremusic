import { useState } from 'react'
import './BpmGenreBadge.css'

export default function BpmGenreBadge({ genre }) {
  const [flipped, setFlipped] = useState(false)

  function toggleFlip() {
    setFlipped((f) => !f)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleFlip()
    }
  }

  return (
    <div
      className="bpm-badge"
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${genre.name} badge, press to see details`}
      onClick={toggleFlip}
      onKeyDown={handleKeyDown}
      style={{ '--card-color': genre.color, '--card-gradient': genre.gradient }}
    >
      <div className={`bpm-badge__flip ${flipped ? 'bpm-badge__flip--flipped' : ''}`}>
        <div className="bpm-badge__face bpm-badge__face--front" aria-hidden={flipped}>
          <span className="bpm-badge__band" aria-hidden="true" />
          <span className="bpm-badge__photo">{genre.emoji}</span>
          <h3 className="bpm-badge__name">{genre.name}</h3>
          <p className="bpm-badge__secondary">{genre.bpmRange} BPM</p>
        </div>
        <div className="bpm-badge__face bpm-badge__face--back" aria-hidden={!flipped}>
          <span className="bpm-badge__band" aria-hidden="true" />
          <h3 className="bpm-badge__name bpm-badge__name--small">{genre.name}</h3>
          <p className="bpm-badge__bio">{genre.description}</p>
        </div>
      </div>
    </div>
  )
}
