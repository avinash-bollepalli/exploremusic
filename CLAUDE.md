# CLAUDE.md

This file guides Claude Code when working in this repository.

## Project

**explorenewmusic** — a React 18 + Vite 5 single-page app for discovering music genres and artists. Plain JavaScript/JSX (no TypeScript — the `@types/react*` devDeps are editor aids only, there's no `tsconfig.json`). Client-side routing via `react-router-dom` v6. No backend: the app calls the Spotify Web API directly from the browser using the Client Credentials flow (app-level auth, no user login).

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build into dist/
npm run lint      # eslint .
npm run preview  # preview the production build
```

There is no test suite/framework configured in this repo.

## Environment

Requires a `.env` file (gitignored) with Spotify credentials — copy `.env.example`:

```
VITE_SPOTIFY_CLIENT_ID=...
VITE_SPOTIFY_CLIENT_SECRET=...
```

The `VITE_` prefix is required by Vite to expose these to the browser bundle at build time.

## Architecture

```
src/main.jsx              React bootstrap, mounts <App /> into index.html's #root
src/App.jsx                BrowserRouter shell: persistent <Header/>, routes "/" -> Home,
                            "/genre/:genreId" -> GenrePage, "*" -> Home
src/pages/
  Home.jsx                  Hero + genre grid (renders GenreCard per entry in genres.js)
  GenrePage.jsx              Genre detail + live artist fetch from Spotify; loading/error/empty states
src/components/
  Header.jsx                 Nav bar with live genre search (filters genres.js by name/tags)
  GenreCard.jsx               Clickable genre tile, per-genre color injected via inline CSS vars
  ArtistCard.jsx               Spotify artist display (photo, followers, popularity ring)
src/data/genres.js          Static catalogue of 12 genres — the in-app "database", no network call
src/services/spotify.js     Spotify API client: token fetch/caching + getArtistsByGenre,
                            getAvailableGenres, getArtist, getArtistTopTracks, getRelatedArtists
src/index.css                Global design system: CSS custom-property tokens (dark theme,
                            per-genre "vibe" colors), resets, shared animations/utilities
```

Each component/page has a paired `.css` file. `src/data/genres.js` is imported by `Home.jsx`, `GenreCard.jsx`, `GenrePage.jsx`, and `Header.jsx`.

For a full file-by-file breakdown, a Mermaid architecture diagram, and the request-lifecycle walkthrough, see `dev-readme.md`.

## Conventions

- No CSS framework — hand-rolled CSS custom-properties design system; styling is component-scoped `.css` files, not CSS modules or Tailwind.
- Per-entity theming (genre colors/gradients) is injected via inline `style={{ '--card-color': ... }}` and consumed with `var(--card-color)` in CSS, rather than JS conditionals.
- Package manager is npm (`package-lock.json` is the lockfile — don't introduce yarn/pnpm files).
- No deployment config yet (no `vercel.json`/`netlify.toml`); Docker/Kubernetes are roadmap items, not yet implemented.
