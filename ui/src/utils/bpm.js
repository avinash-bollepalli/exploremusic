import { genres } from '../data/genres'

export function parseBpmRange(range) {
  const [low, high] = range.split('–').map(Number)
  return [low, high]
}

function rangesOverlap([low1, high1], [low2, high2]) {
  return Math.max(low1, low2) <= Math.min(high1, high2)
}

// Other genres (excluding `genre`) whose range overlaps it.
export function getBpmFits(genre) {
  const range = parseBpmRange(genre.bpmRange)
  return genres.filter((g) => g.id !== genre.id && rangesOverlap(range, parseBpmRange(g.bpmRange)))
}

// All genres (including any exact match) whose range overlaps the given [low, high].
export function getGenresInRange(range) {
  return genres.filter((g) => rangesOverlap(range, parseBpmRange(g.bpmRange)))
}
