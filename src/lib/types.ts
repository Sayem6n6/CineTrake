export type Genre = {
  id: number;
  name: string;
};

export type MovieSummary = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  genre_ids: number[];
  genre_names: string[];
  popularity: number;
  vote_count: number;
  hype_score: number;
  trending_rank?: number;
};

export type MovieCredit = {
  id: number;
  name: string;
  character?: string;
  job?: string;
  profile_path?: string | null;
};

export type MovieVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

export type MovieDetail = MovieSummary & {
  runtime: number | null;
  genres: Genre[];
  cast: MovieCredit[];
  director: MovieCredit | null;
  trailer: MovieVideo | null;
};

export type WatchlistMovie = {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  overview: string | null;
  poster_path: string | null;
  release_date: string | null;
  genre_names: string[] | null;
  popularity: number | null;
  hype_score: number | null;
  created_at: string;
};

export type MovieVoteSummary = {
  movieId: number;
  hype: number;
  unhype: number;
  userVote: "hype" | "unhype" | null;
};

export type MovieComment = {
  id: string;
  movieId: number;
  userId: string;
  username: string;
  body: string;
  createdAt: string;
};

export type BlogPostStatus = "pending" | "approved";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: BlogPostStatus;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserSummary = {
  id: string;
  username: string;
  role: "admin" | "user";
  adsDisabled: boolean;
  createdAt: string;
};

export type AdSettings = {
  globalAdsDisabled: boolean;
  users: AdminUserSummary[];
};
