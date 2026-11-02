// Spotify data API client
// Calls the local `service` backend (proxied to it in dev via Vite), which
// holds the Spotify Client Credentials token and talks to Spotify itself.
// No Spotify credentials live in the browser anymore.

const API_BASE = '/api'

async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) throw new Error(`API error: ${res.status} — ${endpoint}`)
  return res.json()
}

/**
 * Fetch top artists for a given genre
 * @param {string} genre - e.g. "jazz", "electronic", "hip-hop"
 * @param {number} limit - number of artists to return (max 50)
 */
export async function getArtistsByGenre(genre, limit = 12) {
  return apiFetch(`/artists?genre=${encodeURIComponent(genre)}&limit=${limit}`)
}

/**
 * Fetch available genre seeds (Spotify's curated genre list)
 */
export async function getAvailableGenres() {
  return apiFetch('/genres')
}

/**
 * Fetch a single artist by ID
 */
export async function getArtist(artistId) {
  return apiFetch(`/artists/${artistId}`)
}

/**
 * Fetch top tracks for an artist
 */
export async function getArtistTopTracks(artistId, market = 'US') {
  return apiFetch(`/artists/${artistId}/top-tracks?market=${market}`)
}

/**
 * Fetch related artists for an artist
 */
export async function getRelatedArtists(artistId) {
  return apiFetch(`/artists/${artistId}/related-artists`)
}
