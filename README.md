# CineTrake

A full-stack Next.js App Router app for discovering upcoming movies, ranking them by public interest, and saving a private MongoDB-backed watchlist.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS v4 with shadcn-style UI primitives
- Framer Motion animations
- TMDB API for upcoming, trending, search, details, videos, and credits
- MongoDB for users, sessions, and saved movies
- Custom username/password auth with bcrypt hashes, HTTP-only session cookies, and a simple signup captcha
- Dark/light/system theme support with `next-themes`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

3. Add your TMDB token and MongoDB URI to `.env.local`.

4. Start the local server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

MongoDB collections are created automatically on first signup/save. No SQL setup, email provider, or confirmation flow is required.

## TMDB Data

The app uses:

- `/movie/upcoming`
- `/trending/movie/week`
- `/genre/movie/list`
- `/search/movie`
- `/movie/{movie_id}?append_to_response=videos,credits`

`hype_score` is a local ranking formula based on TMDB popularity, vote count, and whether a title appears in weekly trending results.

## Routes

- `/` discovery homepage with search, genre/month filters, sorting, cards, countdowns, and tracking buttons
- `/movie/[id]` cinematic detail page with poster, backdrop, cast, director, runtime, trailer, scores, and tracking
- `/dashboard` protected dashboard for tracked movies, blog writing, and admin review
- `/watchlist` redirects to `/dashboard`
- `/blog` public approved blog posts
- `/login` and `/signup` username/password auth
- `/api/watchlist` authenticated watchlist read/write API
- `/api/movies/[movieId]/vote` authenticated hype/unhype voting
- `/api/movies/[movieId]/comments` authenticated comments
- `/privacy` and `/terms` legal pages

## Vercel Deployment

1. Push the project to GitHub.
2. Import it in Vercel.
3. Add the environment variables from `.env.example`.
4. Make sure your MongoDB Atlas cluster allows Vercel outbound traffic, or temporarily allow `0.0.0.0/0` for development.
5. Deploy.
