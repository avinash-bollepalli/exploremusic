import { useCallback, useEffect, useRef, useState } from 'react'
import { bpmBuckets } from '../data/bpmBuckets'
import GenreCard from '../components/GenreCard'
import EtchedAccretion from '../components/EtchedAccretion'
import './Home.css'

const MIN_PITCH = 58 // px, comfortable rail spacing per badge before switching to carousel
const BADGE_WIDTH_WIDE = 124
const BADGE_WIDTH_NARROW = 96
const NARROW_VIEWPORT = 420 // px, below this the badge itself shrinks
const PEEK_PITCH_FACTOR = 1.2
const SWIPE_DISTANCE_THRESHOLD = 60
const RESTING_TILTS = [-3, 2, -1.5, 4, -2.5, 1, -4, 2.5, -1, 3.5, -2, 1.5]
const HOVER_KICK = 22
const NEIGHBOR_KICK = 10

function canonicalSlotX(position, count, width) {
  return (position + 0.5) * (width / count) - width / 2
}

function carouselSlotX(index, activeIndex, peekPitch) {
  return (index - activeIndex) * peekPitch
}

export default function Home() {
  const stageRef = useRef(null)
  const badgesRef = useRef(new Map())
  const slotOrderRef = useRef(bpmBuckets.map((_, i) => i))
  const rafRef = useRef(0)
  const lastRef = useRef(0)

  const [stageWidth, setStageWidth] = useState(0)
  const [badgeWidth, setBadgeWidth] = useState(BADGE_WIDTH_WIDE)
  const [activeIndex, setActiveIndex] = useState(0)
  const [captionIndex, setCaptionIndex] = useState(null)
  const [captionShowingBack, setCaptionShowingBack] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const count = bpmBuckets.length
  const isRail = stageWidth >= count * MIN_PITCH

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = (width) => {
      setStageWidth(width)
      const base = width < NARROW_VIEWPORT ? BADGE_WIDTH_NARROW : BADGE_WIDTH_WIDE
      const fitWidth = (width / count) * 1.35 // shrink badges to keep the full rail visible when there are many
      setBadgeWidth(Math.max(BADGE_WIDTH_NARROW, Math.min(base, fitWidth)))
    }
    measure(stage.clientWidth)
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]
      if (box) measure(box.contentRect.width)
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const tick = useCallback((now) => {
    rafRef.current = 0
    const dt = Math.min((now - lastRef.current) / 1000, 0.05)
    lastRef.current = now
    let busy = false
    badgesRef.current.forEach((api) => {
      api.step(dt)
      if (!api.isSettled()) busy = true
    })
    if (busy) rafRef.current = requestAnimationFrame(tick)
  }, [])

  const wake = useCallback(() => {
    if (reducedMotion) return
    if (!rafRef.current) {
      lastRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [reducedMotion, tick])

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }, [])

  const registerBadge = useCallback((index, api) => {
    if (api) badgesRef.current.set(index, api)
    else badgesRef.current.delete(index)
  }, [])

  const applyLayout = useCallback((overrideIndex = null, overrideX = null) => {
    const peekPitch = badgeWidth * PEEK_PITCH_FACTOR
    for (let i = 0; i < count; i++) {
      const api = badgesRef.current.get(i)
      if (!api) continue
      if (overrideIndex === i && overrideX !== null) {
        api.setTargetX(overrideX, true)
        continue
      }
      const x = isRail
        ? canonicalSlotX(slotOrderRef.current.indexOf(i), count, stageWidth)
        : carouselSlotX(i, activeIndex, peekPitch)
      api.setTargetX(x, reducedMotion)
    }
    if (!reducedMotion) wake()
  }, [stageWidth, badgeWidth, activeIndex, isRail, count, reducedMotion, wake])

  useEffect(() => {
    applyLayout()
  }, [applyLayout])

  const handleReorderDrag = useCallback((index, dx) => {
    const pos = slotOrderRef.current.indexOf(index)
    const baseX = canonicalSlotX(pos, count, stageWidth)
    const neighborPos = dx > 0 ? pos + 1 : pos - 1
    if (neighborPos >= 0 && neighborPos < count) {
      const neighborIndex = slotOrderRef.current[neighborPos]
      const neighborX = canonicalSlotX(neighborPos, count, stageWidth)
      const pitch = Math.abs(neighborX - baseX)
      if (pitch > 0 && Math.abs(dx) > pitch / 2) {
        slotOrderRef.current[pos] = neighborIndex
        slotOrderRef.current[neighborPos] = index
      }
    }
    applyLayout(index, baseX + dx)
  }, [count, stageWidth, applyLayout])

  const handleReorderEnd = useCallback(() => {
    slotOrderRef.current = bpmBuckets.map((_, i) => i)
    applyLayout()
  }, [applyLayout])

  const handleSwipeDrag = useCallback((dx) => {
    const peekPitch = badgeWidth * PEEK_PITCH_FACTOR
    for (let i = 0; i < count; i++) {
      const api = badgesRef.current.get(i)
      if (!api) continue
      api.setTargetX(carouselSlotX(i, activeIndex, peekPitch) + dx, true)
    }
  }, [badgeWidth, activeIndex, count])

  const handleSwipeEnd = useCallback((dx) => {
    const delta = Math.abs(dx) > SWIPE_DISTANCE_THRESHOLD ? (dx < 0 ? 1 : -1) : 0
    if (delta === 0) {
      applyLayout()
    } else {
      setActiveIndex((prev) => Math.max(0, Math.min(count - 1, prev + delta)))
    }
  }, [count, applyLayout])

  const lastWheelRef = useRef(0)
  const handleWheel = useCallback((e) => {
    if (isRail) return // everything's already visible, nothing to scroll
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 10) return
    const now = performance.now()
    if (now - lastWheelRef.current < 300) return
    lastWheelRef.current = now
    setActiveIndex((prev) => Math.max(0, Math.min(count - 1, prev + (e.deltaX > 0 ? 1 : -1))))
  }, [isRail, count])

  const handleHover = useCallback((index, entering) => {
    if (entering) {
      setCaptionIndex(index)
      if (!reducedMotion) {
        badgesRef.current.get(index)?.applyImpulse(HOVER_KICK)
        badgesRef.current.get(index - 1)?.applyImpulse(-NEIGHBOR_KICK)
        badgesRef.current.get(index + 1)?.applyImpulse(NEIGHBOR_KICK)
        wake()
      }
    } else {
      setCaptionIndex((prev) => (prev === index ? null : prev))
    }
  }, [reducedMotion, wake])

  const handleFlipChange = useCallback((index, flipped) => {
    setCaptionIndex(index)
    setCaptionShowingBack(flipped)
  }, [])

  const captionBucket = captionIndex !== null ? bpmBuckets[captionIndex] : null
  const captionTitle = captionBucket
    ? `${captionBucket.bpmRange} BPM — ${captionBucket.genres.join(', ')}`
    : 'Click any tempo range to see which genres live there'
  const captionHint = captionBucket
    ? (captionShowingBack ? 'Click again to turn it back' : 'Click to flip the badge')
    : ''

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
            Pulled in by rhythm, not gravity — dive into {bpmBuckets.length} tempo ranges
            and find the genres that live at each speed.
          </p>
          <a href="#genres" className="hero__cta" id="hero-cta">
            Start Exploring
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </a>
        </div>
      </EtchedAccretion>

      {/* Genre Rail */}
      <section className="genres-section" id="genres" aria-label="Music genres">
        <div className="container">
          <div className="genres-section__header">
            <h2 className="genres-section__title">
              Explore by <span className="gradient-text">Tempo</span>
            </h2>
            <p className="genres-section__subtitle">
              Click any BPM range to see which genres live there
            </p>
          </div>

          <div
            ref={stageRef}
            className="genre-rail"
            data-mode={isRail ? 'rail' : 'carousel'}
            style={{ '--badge-w': `${badgeWidth}px` }}
            onWheel={handleWheel}
          >
            <span className="genre-rail__bar" aria-hidden="true" />
            <div className="genre-rail__track" role="list">
              {bpmBuckets.map((bucket, i) => (
                <GenreCard
                  key={bucket.id}
                  genre={bucket}
                  index={i}
                  restingAngle={RESTING_TILTS[i % RESTING_TILTS.length]}
                  mode={isRail ? 'rail' : 'carousel'}
                  reducedMotion={reducedMotion}
                  onRegister={registerBadge}
                  onHover={handleHover}
                  onFlipChange={handleFlipChange}
                  onReorderDrag={handleReorderDrag}
                  onReorderEnd={handleReorderEnd}
                  onSwipeDrag={handleSwipeDrag}
                  onSwipeEnd={handleSwipeEnd}
                  wake={wake}
                />
              ))}
            </div>
          </div>

          <div className="genre-rail__caption" aria-live="polite">
            <p className="genre-rail__caption-title">{captionTitle}</p>
            {captionHint && <p className="genre-rail__caption-hint">{captionHint}</p>}
          </div>

          {!isRail && stageWidth > 0 && (
            <div className="genre-rail__dots" role="tablist" aria-label="Show BPM range">
              {bpmBuckets.map((bucket, i) => (
                <button
                  key={bucket.id}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === i}
                  aria-label={`Show ${bucket.bpmRange} BPM`}
                  className="genre-rail__dot"
                  data-active={activeIndex === i || undefined}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}
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
