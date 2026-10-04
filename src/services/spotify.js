// Spotify API Service
// Uses Client Credentials Flow (server-to-server, no user login needed)
// Credentials are stored in .env as VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET

const CLIENT_ID     = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
const TOKEN_URL     = 'https://accounts.spotify.com/api/token'
const API_BASE      = 'https://api.spotify.com/v1'

let cachedToken = null
let tokenExpiry = 0

/** Fetch (or return cached) OAuth2 access token */
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`)

  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return cachedToken
}

/** Generic authenticated GET request */
async function spotifyFetch(endpoint) {
  const token = await getAccessToken()
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Spotify API error: ${res.status} — ${endpoint}`)
  return res.json()
}

/**
 * Fetch top artists for a given genre (uses Spotify search)
 * @param {string} genre - e.g. "jazz", "electronic", "hip-hop"
 * @param {number} limit - number of artists to return (max 50)
 */
export async function getArtistsByGenre(genre, limit = 12) {
  const encoded = encodeURIComponent(`genre:"${genre}"`)
  const data = await spotifyFetch(
    `/search?q=${encoded}&type=artist&limit=${limit}&market=US`
  )
  return data.artists?.items ?? []
}

/**
 * Fetch available genre seeds (Spotify's curated genre list)
 */
export async function getAvailableGenres() {
  const data = await spotifyFetch('/recommendations/available-genre-seeds')
  return data.genres ?? []
}

/**
 * Fetch a single artist by ID
 */
export async function getArtist(artistId) {
  return spotifyFetch(`/artists/${artistId}`)
}

/**
 * Fetch top tracks for an artist
 */
export async function getArtistTopTracks(artistId, market = 'US') {
  const data = await spotifyFetch(`/artists/${artistId}/top-tracks?market=${market}`)
  return data.tracks ?? []
}

/**
 * Fetch related artists for an artist
 */
export async function getRelatedArtists(artistId) {
  const data = await spotifyFetch(`/artists/${artistId}/related-artists`)
  return data.artists ?? []
}
