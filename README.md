# 🎵 explorenewmusic

> Discover new music genres and affiliated artists — powered by the Spotify API.

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)](https://vitejs.dev)
[![Spotify](https://img.shields.io/badge/Spotify-API-1db954?logo=spotify)](https://developer.spotify.com)

## ✨ Features

- 🎸 **12 curated music genres** — Electronic, Jazz, Hip-Hop, Classical, Rock, Latin, R&B, Folk, Metal, Pop, Ambient, Reggae
- 🎤 **Live artist discovery** — fetches top artists per genre directly from the Spotify API
- 🔍 **Instant genre search** — search by genre name, vibe, or tag in the header
- 🌙 **Dark mode design** — vibrant gradient accents on a deep dark theme
- ⚡ **Fast & responsive** — built with Vite + React, mobile-friendly layout

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Spotify Developer account](https://developer.spotify.com/dashboard) (free)

### 1. Clone & Install

```bash
git clone https://github.com/avinash-bollepalli/exploremusic.git
cd exploremusic
npm install
```

### 2. Set Up Spotify Credentials

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` with your Spotify app credentials:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

> **Get credentials:** Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → Create an app → Copy Client ID & Client Secret.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
npm run build       # Build to dist/
npm run preview     # Preview the production build locally
```

## 🗂️ Project Structure

```
exploremusic/
├── src/
│   ├── components/
│   │   ├── Header.jsx / .css      # Sticky nav with live search
│   │   ├── GenreCard.jsx / .css   # Animated genre tile
│   │   └── ArtistCard.jsx / .css  # Artist card with Spotify link
│   ├── pages/
│   │   ├── Home.jsx / .css        # Hero + genre grid
│   │   └── GenrePage.jsx / .css   # Genre detail + live artists
│   ├── services/
│   │   └── spotify.js             # Spotify API integration
│   ├── data/
│   │   └── genres.js              # Curated genre catalogue
│   ├── App.jsx                    # Router
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global design system
├── index.html                     # HTML entry (SEO meta tags)
├── vite.config.js
├── .env.example                   # Credentials template
└── package.json
```

## 🛣️ Roadmap

- [x] Phase 1 — Basic website with genre browser & artist discovery
- [ ] Phase 2 — Docker containerization
- [ ] Phase 3 — Kubernetes deployment

## 📄 License

MIT