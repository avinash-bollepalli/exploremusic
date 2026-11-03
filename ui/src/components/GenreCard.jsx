import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './GenreCard.css'

const MAX_STRETCH = 28 // px, soft-clamped pull distance
const TAP_DISTANCE = 10 // px — generous enough to absorb trackpad/mouse jitter on a click
const TAP_DURATION = 300 // ms

const POSITION_SPRING = { k: 90, c: 14 }
const SWING_SPRING = { k: 40, c: 6 }
const FLIP_SPRING = { k: 70, c: 11 }
const PULL_SPRING = { k: 120, c: 16 }

const SETTLE_EPS = { value: 0.05, velocity: 0.03 }

// Damped-harmonic step (semi-implicit Euler): F = -k*(value-target) - c*velocity.
function springStep(value, velocity, target, { k, c }, dt) {
  const accel = -k * (value - target) - c * velocity
  const nextVelocity = velocity + accel * dt
  const nextValue = value + nextVelocity * dt
  return [nextValue, nextVelocity]
}

function isSettled(value, velocity, target) {
  return Math.abs(value - target) < SETTLE_EPS.value && Math.abs(velocity) < SETTLE_EPS.velocity
}

export default function GenreCard({
  genre,
  index,
  restingAngle,
  mode,
  reducedMotion,
  onRegister,
  onHover,
  onFlipChange,
  onReorderDrag,
  onReorderEnd,
  onSwipeDrag,
  onSwipeEnd,
  wake,
}) {
  const badgeElRef = useRef(null)
  const flipElRef = useRef(null)
  const [flipped, setFlippedState] = useState(false)

  const flippedRef = useRef(flipped)
  flippedRef.current = flipped
  const reducedMotionRef = useRef(reducedMotion)
  reducedMotionRef.current = reducedMotion
  const modeRef = useRef(mode)
  modeRef.current = mode

  const phys = useRef({
    x: 0, vx: 0, tx: 0,
    angle: restingAngle, vAngle: 0,
    rotY: 0, vRotY: 0,
    pull: 0, vPull: 0, tPull: 0,
  })

  function writeDom() {
    const p = phys.current
    if (badgeElRef.current) {
      badgeElRef.current.style.setProperty('--badge-x', `${p.x.toFixed(2)}px`)
      badgeElRef.current.style.setProperty('--badge-angle', `${p.angle.toFixed(2)}deg`)
    }
    if (flipElRef.current) {
      flipElRef.current.style.setProperty('--badge-flip-deg', `${p.rotY.toFixed(2)}deg`)
      flipElRef.current.style.setProperty('--badge-pull', `${p.pull.toFixed(2)}px`)
    }
  }

  const apiRef = useRef(null)
  if (!apiRef.current) {
    apiRef.current = {
      setTargetX(x, immediate) {
        const p = phys.current
        p.tx = x
        if (immediate || reducedMotionRef.current) {
          p.x = x
          p.vx = 0
          writeDom()
        }
      },
      applyImpulse(delta) {
        if (reducedMotionRef.current) return
        phys.current.vAngle += delta
      },
      step(dt) {
        const p = phys.current
        ;[p.x, p.vx] = springStep(p.x, p.vx, p.tx, POSITION_SPRING, dt)
        ;[p.angle, p.vAngle] = springStep(p.angle, p.vAngle, restingAngle, SWING_SPRING, dt)
        const targetRotY = flippedRef.current ? 180 : 0
        ;[p.rotY, p.vRotY] = springStep(p.rotY, p.vRotY, targetRotY, FLIP_SPRING, dt)
        ;[p.pull, p.vPull] = springStep(p.pull, p.vPull, p.tPull, PULL_SPRING, dt)
        writeDom()
      },
      isSettled() {
        const p = phys.current
        const targetRotY = flippedRef.current ? 180 : 0
        return (
          isSettled(p.x, p.vx, p.tx) &&
          isSettled(p.angle, p.vAngle, restingAngle) &&
          isSettled(p.rotY, p.vRotY, targetRotY) &&
          isSettled(p.pull, p.vPull, p.tPull)
        )
      },
    }
  }

  useEffect(() => {
    onRegister(index, apiRef.current)
    return () => onRegister(index, null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // Mount sway: a small random impulse, staggered like the old fadeUp delay.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!reducedMotionRef.current) {
        phys.current.vAngle += (index % 2 ? -1 : 1) * (18 - (index % 4) * 2)
        wake()
      }
    }, 80 + index * 70)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleFlip() {
    const next = !flippedRef.current
    flippedRef.current = next
    setFlippedState(next)
    if (reducedMotionRef.current) {
      phys.current.rotY = next ? 180 : 0
      phys.current.vRotY = 0
      writeDom()
    } else {
      wake()
    }
    onFlipChange(index, next)
  }

  const gestureRef = useRef({ active: false, id: -1, startX: 0, startY: 0, startT: 0, mode: '' })

  function handlePointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return
    const g = gestureRef.current
    g.active = true
    g.id = e.pointerId
    g.startX = e.clientX
    g.startY = e.clientY
    g.startT = performance.now()
    g.mode = ''
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  function handlePointerMove(e) {
    const g = gestureRef.current
    if (!g.active || e.pointerId !== g.id) return
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (!g.mode) {
      if (Math.hypot(dx, dy) < TAP_DISTANCE) return
      g.mode = dy > 0 && Math.abs(dy) > Math.abs(dx) ? 'pull' : 'drag'
    }
    if (g.mode === 'pull') {
      const clampedDy = Math.max(0, dy)
      const target = MAX_STRETCH * Math.tanh(clampedDy / MAX_STRETCH)
      if (reducedMotionRef.current) {
        phys.current.pull = target
        phys.current.vPull = 0
        writeDom()
      } else {
        phys.current.tPull = target
        wake()
      }
    } else if (g.mode === 'drag') {
      if (modeRef.current === 'rail') onReorderDrag(index, dx)
      else onSwipeDrag(dx)
    }
  }

  function endGesture(e, cancelled) {
    const g = gestureRef.current
    if (!g.active || e.pointerId !== g.id) return
    g.active = false
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    const elapsed = performance.now() - g.startT
    // Decide "was this a tap" from the NET displacement at release, not from
    // whether drag/pull mode ever got armed along the way — a click's
    // incidental jitter (trackpads especially) can cross the mode threshold
    // and back without the gesture ever being a real drag.
    const wasTap = !cancelled && Math.hypot(dx, dy) < TAP_DISTANCE && elapsed < TAP_DURATION
    if (wasTap) {
      if (g.mode === 'pull') {
        phys.current.tPull = 0
        wake()
      } else if (g.mode === 'drag') {
        if (modeRef.current === 'rail') onReorderEnd(index)
        else onSwipeEnd(0)
      }
      toggleFlip()
    } else if (g.mode === 'pull') {
      phys.current.tPull = 0
      wake()
    } else if (g.mode === 'drag') {
      if (modeRef.current === 'rail') onReorderEnd(index)
      else onSwipeEnd(cancelled ? 0 : dx)
    }
    g.mode = ''
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleFlip()
    }
  }

  function handleHoverStart() {
    onHover(index, true)
  }
  function handleHoverEnd() {
    onHover(index, false)
  }

  return (
    <div
      ref={badgeElRef}
      role="listitem"
      className="genre-badge"
      style={{ '--card-color': genre.color, '--card-gradient': genre.gradient }}
    >
      <span className="genre-badge__ring" aria-hidden="true" />
      <span className="genre-badge__strap" aria-hidden="true">
        <span className="genre-badge__reel" aria-hidden="true" />
      </span>
      <span className="genre-badge__clip" aria-hidden="true" />
      <div
        ref={flipElRef}
        className="genre-badge__flip"
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${genre.bpmRange} BPM badge, press to see details`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => endGesture(e, false)}
        onPointerCancel={(e) => endGesture(e, true)}
        onPointerEnter={handleHoverStart}
        onPointerLeave={handleHoverEnd}
        onFocus={handleHoverStart}
        onBlur={handleHoverEnd}
        onKeyDown={handleKeyDown}
      >
        <div className="genre-badge__face genre-badge__face--front" aria-hidden={flipped}>
          <span className="genre-badge__band" />
          <h3 className="genre-badge__name genre-badge__name--bpm">{genre.bpmRange}</h3>
          <p className="genre-badge__secondary genre-badge__secondary--bpm">BPM</p>
          <span className="genre-badge__divider" aria-hidden="true" />
          <Link
            to={`/bpm/${genre.bpmRange.replace('–', '-')}`}
            className="genre-badge__explore"
            aria-label={`See genres near ${genre.bpmRange} BPM`}
            tabIndex={flipped ? -1 : undefined}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Explore
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="genre-badge__face genre-badge__face--back" aria-hidden={!flipped}>
          <span className="genre-badge__band" />
          <h3 className="genre-badge__name genre-badge__name--small">{genre.bpmRange} BPM</h3>
          <ul className="genre-badge__list">
            {genre.genres.map((name) => (
              <li key={name} className="genre-badge__list-item">{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
