import type { MovieDetails, TMDBResponse } from "../types/movie";

const BASE_URL = "https://api.themoviedb.org/3";
export const IMG_BASE = "https://image.tmdb.org/t/p";

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB API key not defined. Add VITE_TMDB_API_KEY to .env");
  return apiKey;
}

async function apiFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.status_message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function searchMovies(query: string, page = 1): Promise<TMDBResponse> {
  if (!query.trim()) return { results: [], total_results: 0, total_pages: 0, page: 1 };
  return apiFetch<TMDBResponse>("/search/movie", { query, page: String(page) });
}

export async function getPopularMovies(page = 1): Promise<TMDBResponse> {
  return apiFetch<TMDBResponse>("/movie/popular", { page: String(page) });
}

export async function getTrendingMovies(): Promise<TMDBResponse> {
  return apiFetch<TMDBResponse>("/trending/movie/week");
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  return apiFetch<MovieDetails>(`/movie/${id}`);
}

export async function getMoviesByGenre(genreId: number, page = 1): Promise<TMDBResponse> {
  return apiFetch<TMDBResponse>("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
    page: String(page),
  });
}

export function getPosterUrl(path: string | null, size: "w185" | "w342" | "w500" | "w780" | "original" = "w342"): string {
  if (!path) return "/placeholder-movie.png";
  return `${IMG_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: "w780" | "w1280" | "original" = "w1280"): string {
  if (!path) return "";
  return `${IMG_BASE}/${size}${path}`;
}

export const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};