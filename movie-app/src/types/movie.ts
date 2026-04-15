export interface Movie {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  popularity?: number;
  vote_count?: number;
  original_language?: string;
  status?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  tagline: string;
  status: string;
  budget?: number;
  revenue?: number;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
}

export interface TMDBResponse {
  results: Movie[];
  total_results: number;
  total_pages: number;
  page: number;
}