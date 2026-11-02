# CLAUDE.md

This file guides Claude Code when working in this repository.

## Project

**explorenewmusic** — a two-module Maven project for discovering music genres and artists:
- `service` — a Spring Boot (Java 21) backend that proxies the Spotify Web API using the Client Credentials flow (app-level auth, no user login), holding the real Spotify client id/secret server-side.
- `ui` — the React 18 + Vite 5 single-page frontend. Plain JavaScript/JSX (no TypeScript — the `@types/react*` devDeps are editor aids only, there's no `tsconfig.json`). Client-side routing via `react-router-dom` v6. Calls `service` at `/api/*` instead of calling Spotify directly, so the Spotify client secret is never shipped to the browser.

A root `pom.xml` aggregates both modules (`<modules>service, ui</modules>`); it is an aggregator only, not a Maven inheritance parent — `service` is parented to `spring-boot-starter-parent`, and `ui` has no Java code at all (its `pom.xml` just drives the existing npm/Vite build via `frontend-maven-plugin`).

## Commands

From the repo root:
```bash
mvn clean install              # builds both modules: compiles+tests service, runs npm install && npm run build for ui
mvn -pl service spring-boot:run  # run the backend standalone on :8080
```

From `ui/` (standalone frontend dev loop — requires `service` running on :8080 for live data):
```bash
npm run dev      # start dev server at localhost:3000, proxies /api to localhost:8080
npm run build    # production build into ui/dist/
npm run lint      # eslint .
npm run preview  # preview the production build
```

`service` has a minimal JUnit test suite (`mvn test -pl service`). `ui` has no test suite/framework configured.

## Environment

**Backend (`service`)** — reads Spotify credentials from plain environment variables (no `.env` file loading, no `VITE_` prefix — these never reach the browser):
```bash
export SPOTIFY_CLIENT_ID=...
export SPOTIFY_CLIENT_SECRET=...
```
Optionally `SPOTIFY_MARKET` (defaults to `US`). Set these before `mvn -pl service spring-boot:run` or in your IDE's run configuration.

**Frontend (`ui`)** — no environment variables needed; it only ever talks to the local `/api/*` backend.

## Architecture

```
pom.xml                     Root aggregator (packaging=pom), lists service + ui as modules

service/
  pom.xml                    Spring Boot app (parent: spring-boot-starter-parent)
  src/main/java/com/exploremusic/service/
    ServiceApplication.java    @SpringBootApplication entrypoint
    config/
      SpotifyProperties.java    @ConfigurationProperties(prefix="spotify"): clientId, clientSecret, market
      RestClientConfig.java      RestClient bean used for all outbound HTTP
    spotify/
      SpotifyTokenService.java  Client Credentials token fetch + in-memory cache (expiry - 60s buffer)
      SpotifyClient.java         Calls api.spotify.com, returns raw Spotify JSON unwrapped (no custom DTOs)
    api/
      ArtistController.java      REST surface: /api/artists, /api/genres, /api/artists/{id},
                                  /api/artists/{id}/top-tracks, /api/artists/{id}/related-artists
  src/main/resources/application.yml   server.port=8080, spotify.* bound from env vars
  src/test/java/...            SpotifyTokenServiceTest (cache behavior), ArtistControllerTest (pass-through)

ui/
  pom.xml                     packaging=pom, frontend-maven-plugin drives npm install/build
  index.html, vite.config.js, package.json       (vite.config.js proxies /api -> localhost:8080 in dev)
  src/main.jsx              React bootstrap, mounts <App /> into index.html's #root
  src/App.jsx                BrowserRouter shell: persistent <Header/>, routes "/" -> Home,
                              "/genre/:genreId" -> GenrePage, "*" -> Home
  src/pages/
    Home.jsx                  Hero + genre grid (renders GenreCard per entry in genres.js)
    GenrePage.jsx              Genre detail + live artist fetch via /api; loading/error/empty states
  src/components/
    Header.jsx                 Nav bar with live genre search (filters genres.js by name/tags)
    GenreCard.jsx               Clickable genre tile, per-genre color injected via inline CSS vars
    ArtistCard.jsx               Spotify artist display (photo, followers, popularity ring)
  src/data/genres.js          Static catalogue of 12 genres — the in-app "database", no network call
  src/services/spotify.js     Backend API client (fetch against /api/*): getArtistsByGenre,
                              getAvailableGenres, getArtist, getArtistTopTracks, getRelatedArtists —
                              same exported names/signatures as before the backend split
  src/index.css                Global design system: CSS custom-property tokens (dark theme,
                              per-genre "vibe" colors), resets, shared animations/utilities
```

Each component/page has a paired `.css` file. `ui/src/data/genres.js` is imported by `Home.jsx`, `GenreCard.jsx`, `GenrePage.jsx`, and `Header.jsx`.

For a full file-by-file breakdown, a Mermaid architecture diagram, and the request-lifecycle walkthrough, see `dev-readme.md`.

## Conventions

- No CSS framework — hand-rolled CSS custom-properties design system; styling is component-scoped `.css` files, not CSS modules or Tailwind.
- Per-entity theming (genre colors/gradients) is injected via inline `style={{ '--card-color': ... }}` and consumed with `var(--card-color)` in CSS, rather than JS conditionals.
- Package manager is npm (`ui/package-lock.json` is the lockfile — don't introduce yarn/pnpm files).
- Backend endpoints return Spotify's JSON pass-through (unwrapped arrays/objects), not hand-rolled Java DTOs — this guarantees `ArtistCard.jsx` keeps working without needing to track a separate backend contract.
- No deployment config yet (no `vercel.json`/`netlify.toml`); production topology (same-origin vs. CORS) and Docker/Kubernetes are still roadmap items, not yet implemented.
