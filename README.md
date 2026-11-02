# 🎵 explorenewmusic

> Discover new music genres and affiliated artists — powered by the Spotify API.

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)](https://vitejs.dev)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6db33f?logo=springboot)](https://spring.io/projects/spring-boot)
[![Spotify](https://img.shields.io/badge/Spotify-API-1db954?logo=spotify)](https://developer.spotify.com)

## ✨ Features

- 🎸 **12 curated music genres** — Electronic, Jazz, Hip-Hop, Classical, Rock, Latin, R&B, Folk, Metal, Pop, Ambient, Reggae
- 🎤 **Live artist discovery** — fetches top artists per genre from the Spotify API via a Java backend
- 🔍 **Instant genre search** — search by genre name, vibe, or tag in the header
- 🌙 **Dark mode design** — vibrant gradient accents on a deep dark theme
- ⚡ **Fast & responsive** — built with Vite + React, mobile-friendly layout

## 🏗️ Architecture

Two Maven modules:
- **`service`** — a Spring Boot (Java 21) backend that holds the Spotify client credentials and proxies the Spotify Web API, so secrets never reach the browser.
- **`ui`** — the React 18 + Vite 5 frontend, calling `service` at `/api/*`.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- Java 21 + Maven 3.9+
- A [Spotify Developer account](https://developer.spotify.com/dashboard) (free)

### 1. Clone & Install

```bash
git clone https://github.com/avinash-bollepalli/exploremusic.git
cd exploremusic
```

### 2. Set Up Spotify Credentials

The backend reads Spotify credentials from environment variables (no `.env` file):

```bash
export SPOTIFY_CLIENT_ID=your_spotify_client_id_here
export SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

> **Get credentials:** Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → Create an app → Copy Client ID & Client Secret.

### 3. Run Locally

In one terminal, start the backend:

```bash
mvn -pl service spring-boot:run   # serves /api/* on localhost:8080
```

In another terminal, start the frontend:

```bash
cd ui
npm install
npm run dev                        # localhost:3000, proxies /api to localhost:8080
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
mvn clean install     # builds + tests service, and runs npm install && npm run build for ui (-> ui/dist/)
```

Or, from inside `ui/` for just the frontend:
```bash
npm run build       # Build to ui/dist/
npm run preview     # Preview the production build locally
```

## 🗂️ Project Structure

```
exploremusic/
├── pom.xml                        # Root Maven aggregator (service + ui modules)
├── service/                       # Spring Boot backend
│   ├── pom.xml
│   └── src/main/java/com/exploremusic/service/
│       ├── ServiceApplication.java
│       ├── config/                # SpotifyProperties, RestClientConfig
│       ├── spotify/                # SpotifyTokenService (cached token), SpotifyClient
│       └── api/                     # ArtistController (/api/* REST endpoints)
└── ui/                             # React frontend
    ├── pom.xml                     # Drives npm install/build via frontend-maven-plugin
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx / .css      # Sticky nav with live search
    │   │   ├── GenreCard.jsx / .css   # Animated genre tile
    │   │   └── ArtistCard.jsx / .css  # Artist card with Spotify link
    │   ├── pages/
    │   │   ├── Home.jsx / .css        # Hero + genre grid
    │   │   └── GenrePage.jsx / .css   # Genre detail + live artists
    │   ├── services/
    │   │   └── spotify.js             # Calls local /api/* backend
    │   ├── data/
    │   │   └── genres.js              # Curated genre catalogue
    │   ├── App.jsx                    # Router
    │   ├── main.jsx                   # Entry point
    │   └── index.css                  # Global design system
    ├── index.html                     # HTML entry (SEO meta tags)
    ├── vite.config.js                 # Proxies /api -> localhost:8080 in dev
    └── package.json
```

## 🛣️ Roadmap

- [x] Phase 1 — Basic website with genre browser & artist discovery
- [x] Phase 2 — Spring Boot backend proxying Spotify credentials (no secrets in the browser)
- [ ] Phase 3 — Docker containerization
- [ ] Phase 4 — Kubernetes deployment

## 📄 License

MIT
