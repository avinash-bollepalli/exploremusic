# 📁 explorenewmusic — Developer README

> Detailed breakdown of every file in the project — what it does, how it fits into the architecture, and its contribution to the website.

---

## Architecture Overview

```mermaid
flowchart TD
    Browser["🌐 Browser"]
    HTML["index.html\nEntry point"]
    Main["src/main.jsx\nReact bootstrap"]
    App["src/App.jsx\nRouter"]
    CSS["src/index.css\nDesign system"]
    Header["Header.jsx\nNavigation + Search"]
    Home["Home.jsx\nHero + Genre Grid"]
    GenrePage["GenrePage.jsx\nArtist Browser"]
    GenreCard["GenreCard.jsx\nClickable tile"]
    ArtistCard["ArtistCard.jsx\nArtist display"]
    GenreData["data/genres.js\nStatic catalogue"]
    Spotify["ui/src/services/spotify.js\nBackend API client"]
    Service["service (Spring Boot)\nToken cache + Spotify proxy"]
    SpotifyAPI["☁️ Spotify API"]

    Browser --> HTML --> Main --> App
    App --> CSS
    App --> Header
    App --> Home
    App --> GenrePage
    Home --> GenreCard
    Home --> GenreData
    GenreCard --> GenreData
    GenrePage --> ArtistCard
    GenrePage --> Spotify
    Spotify -- "/api/*" --> Service
    Service --> SpotifyAPI
```

The frontend (`ui`) no longer talks to Spotify directly — it calls the backend (`service`) at `/api/*`, which holds the real Spotify client id/secret and is the only thing that ever talks to `accounts.spotify.com`/`api.spotify.com`.

---

## 🏗️ Project Configuration Files

---

### Root `pom.xml`
**Role:** Maven aggregator for the whole repo — lists `service` and `ui` as modules so `mvn clean install` from the root builds both. It's packaging-only (`<packaging>pom</packaging>`): it has no source of its own and is not a Maven inheritance parent of either module (`service` is parented to `spring-boot-starter-parent`; `ui` has no Java at all). Aggregation (`<modules>`) and inheritance (`<parent>`) are independent in Maven — this project uses the former only at the root.

---

### `service/pom.xml`
**Role:** Spring Boot application manifest. Parent is `spring-boot-starter-parent:3.3.4`, which pins dependency versions and wires sensible Maven defaults (compiler release, resource filtering, etc.) for Java 21.

**Key dependencies:** `spring-boot-starter-web` (embedded Tomcat + Spring MVC), `spring-boot-configuration-processor` (IDE metadata for `@ConfigurationProperties`), `spring-boot-starter-test` (JUnit 5 + Mockito + `MockRestServiceServer`, test scope). The `spring-boot-maven-plugin` packages an executable jar.

---

### `service/src/main/resources/application.yml`
**Role:** Backend runtime config — binds environment variables into Spring, never hardcodes secrets.

```yaml
server:
  port: 8080
spotify:
  client-id: ${SPOTIFY_CLIENT_ID}
  client-secret: ${SPOTIFY_CLIENT_SECRET}
  market: ${SPOTIFY_MARKET:US}
```

`SpotifyProperties` (`@ConfigurationProperties(prefix = "spotify")`) binds the `spotify.*` keys. Devs export `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET` in their shell before running the app — there is deliberately no `.env`-file loader here, so local dev, CI, and any future container deploy all configure secrets the same way (plain environment variables).

---

### `ui/pom.xml`
**Role:** Lets the root `mvn clean install` also produce the frontend build, without disturbing the standalone `npm` workflow. Has no Java code (`<packaging>pom</packaging>`); instead it uses the `frontend-maven-plugin` to download an isolated Node/npm and run `npm install` then `npm run build` as part of Maven's `package` phase. Running `cd ui && npm run dev`/`npm run build` directly still works exactly as before — both paths invoke the same `package.json` scripts, just from different entry points.

---

### `ui/package.json`
**Role:** Project manifest — defines the app's identity, scripts, and dependencies. Lives at `ui/package.json` since the frontend/backend split (was at the repo root before).

```json
{
  "name": "explorenewmusic",
  "scripts": {
    "dev":     "vite",        // Start local dev server at localhost:3000
    "build":   "vite build",  // Bundle for production into dist/
    "preview": "vite preview" // Preview the production build locally
  }
}
```

**Key dependencies:**

| Package | Why |
|---------|-----|
| `react` + `react-dom` | The UI framework — renders components to the DOM |
| `react-router-dom` | Client-side routing (`/` → Home, `/genre/:id` → GenrePage) |
| `vite` | Dev server + build tool (lightning fast HMR) |
| `@vitejs/plugin-react` | Enables JSX transforms in Vite |

---

### `ui/vite.config.js`
**Role:** Configures the Vite build tool and dev server.

```js
export default defineConfig({
  plugins: [react()],   // Enable React/JSX support
  server: {
    port: 3000,         // Dev server runs at localhost:3000
    host: true,         // Expose on network — needed for Docker later
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true }, // forward to service
    },
  }
})
```

> `host: true` binds the server to `0.0.0.0` instead of just `localhost`. This is already set in anticipation of Docker, where containers must be reachable from outside the container's network namespace. The `proxy` block forwards any `/api/*` request from the Vite dev server to `service` on `localhost:8080`, so `npm run dev` only shows real data when the backend is also running. Production topology (same-origin vs. CORS) is still a roadmap item.

---

### `index.html`
**Role:** The single HTML shell that the browser loads. Vite injects the compiled JS/CSS into it at build time.

Key contributions:
- **SEO** — `<title>`, `<meta name="description">`, `<meta name="keywords">`
- **Open Graph** — `og:title` / `og:description` for social sharing previews
- **Google Fonts** — loads `Inter` (body text) and `Outfit` (headings) via CDN `<link>` tags
- **React mount point** — `<div id="root">` is where the entire React app renders
- **Entry script** — `<script type="module" src="/src/main.jsx">` tells Vite where to start bundling

---

### Spotify credentials — no longer a frontend concern
Before the backend split, credentials lived in a frontend `.env.example`/`.env` using the `VITE_SPOTIFY_CLIENT_ID`/`VITE_SPOTIFY_CLIENT_SECRET` vars — and because Vite inlines `VITE_`-prefixed vars into the shipped browser bundle, **the client secret was shipped to every visitor**. That file is gone. Credentials now live only on the backend, as plain `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET` environment variables (see `service/src/main/resources/application.yml` above) — they're read server-side and never serialized into any response the browser receives.

---

### `.gitignore`
**Role:** Tells Git which files to never track.

Critical exclusions:

| Entry | Why excluded |
|-------|-------------|
| `node_modules/` | npm packages under `ui/` — regenerated by `npm install` |
| `.env` / `.env.*` | Would contain real secrets if anyone added one — must never be committed |
| `dist/` | Generated frontend build output (`ui/dist/`), not source code |
| `target/` | Generated Maven build output (`service/target/`), not source code |
| `.DS_Store` | macOS metadata files |

---

## 🎨 Design System

---

### `src/index.css`
**Role:** The global design system — the single source of truth for all visual tokens. Every component inherits from this file.

**What it defines:**

#### CSS Custom Properties (design tokens)
```css
:root {
  /* Backgrounds */
  --clr-bg-deep:     #0a0a0f;   /* Darkest layer */
  --clr-bg-base:     #0f0f1a;   /* Page background */
  --clr-bg-surface:  #161625;   /* Cards */
  --clr-bg-elevated: #1e1e35;   /* Hover states, inputs */

  /* Brand gradient — purple → cyan */
  --clr-primary:   #8b5cf6;
  --clr-accent:    #06b6d4;
  --grad-brand:    linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);

  /* Per-genre vibe colors */
  --vibe-electronic: #8b5cf6;
  --vibe-jazz:       #f59e0b;
  --vibe-hiphop:     #ef4444;
  /* ... 9 more */

  /* Typography */
  --font-display: 'Outfit', sans-serif;  /* Headings */
  --font-body:    'Inter', sans-serif;   /* Body text */
}
```

#### Global Styles
- **CSS reset** — `box-sizing: border-box`, zero margin/padding on all elements
- **Ambient background** — two `radial-gradient` blobs fixed in the background (purple top-left, cyan bottom-right) that create a subtle atmospheric glow across the entire site
- **Custom scrollbar** — 6px wide, glows purple on hover
- **`.gradient-text`** — utility class that clips the brand gradient as text fill (used in headings)
- **`.skeleton`** — shimmer animation utility for loading placeholder cards
- **`.container`** — `max-width: 1280px` centered wrapper used by all page sections
- **`@keyframes fadeUp`** — cards and pages animate upward on entrance
- **`@keyframes shimmer`** — left-to-right sweep used by skeleton loaders

---

## ⚛️ React Application

---

### `src/main.jsx`
**Role:** The React bootstrap — the very first JavaScript that runs in the browser.

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- Grabs the `<div id="root">` from `index.html`
- Creates a React root and renders the entire `<App />` tree into it
- Imports `index.css` to activate the global design system
- `React.StrictMode` catches common mistakes during development (double-renders, deprecated APIs)

---

### `src/App.jsx`
**Role:** The application shell — sets up client-side routing and persistent layout.

```jsx
<BrowserRouter>
  <Header />              {/* Always visible on every page */}
  <main>
    <Routes>
      <Route path="/"               element={<Home />} />
      <Route path="/genre/:genreId" element={<GenrePage />} />
      <Route path="*"               element={<Home />} />  {/* 404 fallback */}
    </Routes>
  </main>
</BrowserRouter>
```

- **`BrowserRouter`** — uses the HTML5 History API for clean URLs (no `#` hashes)
- **`Header`** is rendered **outside** `<Routes>` so it persists across all pages without remounting
- **`:genreId`** is a URL parameter extracted by `GenrePage` via `useParams()`
- The wildcard `path="*"` catches unknown URLs and sends users back to Home

---

## 📊 Data Layer

---

### `src/data/genres.js`
**Role:** Static catalogue of 12 music genres. The in-app "database" — no network call needed.

Each genre object shape:
```js
{
  id:           'electronic',           // URL slug → /genre/electronic
  name:         'Electronic',           // Display name
  spotifyGenre: 'electronic',           // Query string sent to Spotify API
  emoji:        '⚡',                   // Visual identity in cards + hero banner
  description:  'Synthesized...',       // Paragraph shown on genre page
  vibe:         'Energetic · Futuristic · Immersive', // Tone label
  color:        '#8b5cf6',              // Injected as --card-color CSS variable
  gradient:     'linear-gradient(...)', // Injected as --card-gradient CSS variable
  tags:         ['synth', 'EDM', ...]   // Used in header search + tag pills
}
```

This file is imported by **four** different files:
- `Home.jsx` — iterates over all 12 to render the genre grid
- `GenreCard.jsx` — receives one genre as a prop and renders its tile
- `GenrePage.jsx` — looks up genre by URL param; uses `spotifyGenre` to call the API
- `Header.jsx` — filters the list in real-time for the search dropdown

---

### `ui/src/services/spotify.js`
**Role:** All communication with the backend's `/api/*` surface. Isolates API logic from UI components — same exported function names/signatures as before the backend split, so no calling component needed to change.

```js
async function apiFetch(endpoint) {
  const res = await fetch(`/api${endpoint}`)
  if (!res.ok) throw new Error(`API error: ${res.status} — ${endpoint}`)
  return res.json()
}
```

**Exported functions:**

| Function | Calls | What it returns |
|----------|----------|----------------|
| `getArtistsByGenre(genre, limit)` | `GET /api/artists?genre=jazz&limit=12` | Array of artist objects |
| `getAvailableGenres()` | `GET /api/genres` | Array of genre strings |
| `getArtist(artistId)` | `GET /api/artists/:id` | Single artist full profile |
| `getArtistTopTracks(artistId, market)` | `GET /api/artists/:id/top-tracks?market=US` | Array of track objects |
| `getRelatedArtists(artistId)` | `GET /api/artists/:id/related-artists` | Array of artist objects |

---

### `service/src/main/java/com/exploremusic/service/spotify/SpotifyTokenService.java`
**Role:** Server-side equivalent of the token-caching logic that used to live in the browser. Holds the real `clientId`/`clientSecret` (from `SpotifyProperties`) and never exposes them past this class.

**Authentication flow (Client Credentials), now server-to-server for real:**
```
ArtistController calls SpotifyClient.searchArtistsByGenre("jazz", 12)
  → SpotifyClient calls SpotifyTokenService.getAccessToken() (synchronized)
    → if cached token still valid (now < expiry): return it, no HTTP call
    → else: POST https://accounts.spotify.com/api/token, Basic Base64(clientId:clientSecret)
      → Spotify returns { access_token, expires_in: 3600 }
      → cache token, expiry = now + (expires_in - 60s)
  → authenticated GET https://api.spotify.com/v1/search?q=genre:"jazz"&type=artist
    → raw Spotify JSON returned, unwrapped to `artists.items`, straight back to the browser
```
The `synchronized` method (rather than a lock-free `AtomicReference`) deliberately avoids a thundering herd of simultaneous token re-fetches when multiple requests arrive right as the cache expires — call volume here is low enough (at most ~once per 59 minutes under load) that the lock is never a bottleneck.

### `service/src/main/java/com/exploremusic/service/spotify/SpotifyClient.java` + `api/ArtistController.java`
**Role:** `SpotifyClient` calls `api.spotify.com` and returns Spotify's JSON **unmodified** (as Jackson `JsonNode`, not hand-rolled Java DTOs) — this is a deliberate choice: `ArtistCard.jsx` depends on the exact raw Spotify artist shape (`images`, `followers.total`, `genres`, `popularity`, `external_urls.spotify`, `name`, `id`), and passing the JSON through unmodified guarantees the frontend never drifts out of sync with a hand-maintained backend contract. `ArtistController` exposes this as plain REST endpoints under `/api/*` (see table above) — each one maps 1:1 to a function that used to live directly in the browser's `spotify.js`.

---

## 🧩 Components

---

### `src/components/Header.jsx` + `Header.css`
**Role:** Persistent top navigation bar with branding and live genre search.

**Three `useEffect` hooks:**

| Hook | Purpose |
|------|---------|
| `scroll` listener | Sets `scrolled: true` once user scrolls past 40px → triggers glassmorphism |
| `query` watcher | Filters `genres.js` in real-time as user types → updates dropdown |
| `mousedown` listener | Detects clicks outside the search box → closes dropdown |

**Glassmorphism on scroll:**
```css
.header--scrolled {
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px);       /* Frosted glass effect */
  border-bottom: 1px solid var(--clr-border);
}
```

**Search flow:**
1. User types → `query` state updates
2. `useEffect` filters all 12 genres by `name` + `tags` → `results` state
3. Dropdown renders up to 5 matching genres
4. Clicking a result → `navigate('/genre/${id}')` — no page reload

---

### `src/components/GenreCard.jsx` + `GenreCard.css`
**Role:** Clickable animated tile for one music genre. Rendered 12× on the Home page.

**Per-genre CSS variable injection:**
```jsx
<Link style={{
  '--card-color':    genre.color,     // e.g. #f59e0b for Jazz
  '--card-gradient': genre.gradient,  // e.g. gold→red gradient for Jazz
}}>
```
The CSS then uses `var(--card-color)` for hover borders, glows, tag pills, and the CTA arrow — so every card is uniquely themed with zero JavaScript conditionals.

**Staggered entrance animation:**
```jsx
style={{ animationDelay: `${index * 60}ms` }}
```
Cards appear one after another (60ms apart) rather than all at once.

**Visual effects on hover:**
- Card lifts `translateY(-6px)` with deepened shadow
- Radial glow fades in from card color
- Emoji scales to 1.15× and rotates −5°
- CTA arrow slides rightward
- Bottom gradient bar fades in

---

### `src/components/ArtistCard.jsx` + `ArtistCard.css`
**Role:** Displays a single Spotify artist. Rendered in the GenrePage artist grid.

**Spotify artist data it uses:**

| Spotify field | Used for |
|---------------|----------|
| `images[0].url` | Profile photo (`<img>`) |
| `name` | Artist name heading |
| `genres[0]` | Genre label below name |
| `followers.total` | Formatted as "2.3M followers" via `Intl.NumberFormat` |
| `popularity` (0–100) | Drives the circular green ring |
| `external_urls.spotify` | Card `href` — opens Spotify profile |

**Popularity ring (CSS conic-gradient):**
```css
background: conic-gradient(
  #1DB954 var(--pop, 0%),         /* Spotify green fills % = popularity score */
  var(--clr-bg-elevated) 0%       /* Dark grey for remainder */
);
```
An artist with popularity 75 has 75% of the ring filled green.

---

## 📄 Pages

---

### `src/pages/Home.jsx` + `Home.css`
**Role:** The landing page — the first thing every user sees.

**Hero section:**
- Full-viewport-height (`min-height: 100vh`)
- 8 floating music emoji notes animated with `@keyframes floatNote` (staggered by CSS `--i` variable)
- Stats row: `{genres.length} Genres · ∞ Artists · Live Spotify Data`
- CTA button anchors to `#genres` section (smooth scroll via `scroll-behavior: smooth` in `index.css`)

**Genre grid:**
```jsx
{genres.map((genre, i) => (
  <GenreCard genre={genre} index={i} />
))}
```
- CSS Grid with `auto-fill, minmax(280px, 1fr)` → responsive columns, no media query needed
- `index` prop drives the staggered entrance animation delay

---

### `src/pages/GenrePage.jsx` + `GenrePage.css`
**Role:** The genre detail page — full genre profile + live Spotify artist browser.

**URL param → data flow:**
```
/genre/jazz
  → useParams() → { genreId: "jazz" }
  → genres.find(g => g.id === "jazz") → genre object
  → getArtistsByGenre(genre.spotifyGenre, 12) → Spotify API call
  → artists state → ArtistCard grid
```

**Three UI states:**

| State | Rendered |
|-------|---------|
| `loading: true` | 12 skeleton shimmer cards |
| `error: "message"` | Red error box + link to Spotify Developer Dashboard |
| `artists.length > 0` | Full `ArtistCard` grid |
| `artists.length === 0` | "No artists found" message |

**Hero banner theming:**
```jsx
<div style={{
  '--hero-gradient': genre.gradient,
  '--hero-color':    genre.color,
}}>
```
Two absolute-positioned blurred circles (`::before` / `::after`) behind the content create a genre-colored ambient glow — entirely in CSS with the injected variable.

**Related genres:**
Calculates `[currentIndex - 1, currentIndex + 1, currentIndex + 2]` from the genres array (wrapping with modulo), showing 3 sibling genre cards so users can keep exploring.

---

## 📐 Full Request Lifecycle

```
User visits localhost:3000
  → index.html served by Vite
    → main.jsx mounts React into <div id="root">
      → App.jsx wraps everything in BrowserRouter
        → Header.jsx renders (persistent across all routes)
        → Route "/" matched → Home.jsx renders
          → genres.js imported → 12 genre objects
          → 12 × GenreCard.jsx rendered in CSS grid

User clicks "Jazz" card
  → react-router navigates to /genre/jazz (no page reload)
    → Route "/genre/:genreId" matched → GenrePage.jsx renders
      → useParams() returns { genreId: "jazz" }
      → genres.find() returns Jazz genre object
      → getArtistsByGenre("jazz", 12) called (ui/src/services/spotify.js)
        → fetch('/api/artists?genre=jazz&limit=12')
          → [dev] Vite proxy forwards to http://localhost:8080
          → ArtistController.getArtistsByGenre("jazz", 12) (service)
            → SpotifyClient.searchArtistsByGenre
              → SpotifyTokenService.getAccessToken() (cache hit, or POST to Spotify accounts API + cache)
              → GET https://api.spotify.com/v1/search?q=genre:"jazz"&type=artist
                → raw Spotify JSON, unwrapped to artists.items
          → 12 artist objects returned to the browser, unmodified
            → 12 × ArtistCard.jsx rendered with live data

User types "hip" in the header search
  → Header.jsx query state = "hip"
    → useEffect filters genres.js → ["Hip-Hop"]
      → Dropdown renders 1 result
        → User clicks → navigate("/genre/hip-hop")
          → GenrePage.jsx renders for Hip-Hop
```

---

## 🛣️ Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Website with genre browser + Spotify artists | ✅ Done |
| 2 | Spring Boot `service` module proxying Spotify credentials (split from `ui`) | ✅ Done |
| 3 | Dockerfile + multi-stage build | 🔜 Next |
| 4 | Kubernetes manifests (Deployment, Service, Ingress) | 🔜 Later |
