import { useState } from "react";
import type { Movie } from "../types/movie";
import { getPosterUrl } from "../services/tmdb";
import { useFavorites } from "../context/FavoritesContext";

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imgError, setImgError] = useState(false);
  const favorite = isFavorite(movie.id);

  const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const ratingClass =
    movie.vote_average >= 7.5 ? "rating-high" : movie.vote_average >= 6 ? "rating-mid" : "rating-low";

  function handleFavoriteClick(e: React.MouseEvent) {
    e.stopPropagation();
    toggleFavorite(movie);
  }

  return (
    <article
      className={`movie-card ${favorite ? "is-favorite" : ""}`}
      onClick={() => onSelect(movie)}
      role="button"
      tabIndex={0}
      aria-label={`${movie.title} (${year}). Rating: ${rating}. Click for details.`}
      onKeyDown={(e) => e.key === "Enter" && onSelect(movie)}
    >
      <div className="movie-poster-wrap">
        {!imgError && movie.poster_path ? (
          <img
            src={getPosterUrl(movie.poster_path, "w342")}
            alt={`${movie.title} poster`}
            className="movie-poster"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="movie-poster-placeholder" aria-hidden="true">
            <span>🎬</span>
            <span className="placeholder-title">{movie.title}</span>
          </div>
        )}
        <div className={`movie-rating ${ratingClass}`} aria-label={`Rating ${rating}`}>
          ★ {rating}
        </div>
        <button
          className={`fav-btn ${favorite ? "active" : ""}`}
          onClick={handleFavoriteClick}
          aria-label={favorite ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
          title={favorite ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-year">{year}</p>
        {movie.overview && (
          <p className="movie-overview">{movie.overview}</p>
        )}
      </div>
    </article>
  );
}