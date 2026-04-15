import { useEffect, useState } from "react";
import type { Movie, MovieDetails } from "../types/movie";
import { getMovieDetails, getPosterUrl, getBackdropUrl, GENRES } from "../services/tmdb";
import { useFavorites } from "../context/FavoritesContext";

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

export function MovieModal({ movie, onClose }: MovieModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(movie.id);

  useEffect(() => {
    setLoading(true);
    setError("");
    getMovieDetails(movie.id)
      .then(setDetails)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [movie.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const data = details || movie;
  const year = data.release_date ? data.release_date.split("-")[0] : "N/A";
  const rating = data.vote_average ? data.vote_average.toFixed(1) : "N/A";
  const ratingClass =
    data.vote_average >= 7.5 ? "rating-high" : data.vote_average >= 6 ? "rating-mid" : "rating-low";

  const genres =
    details?.genres?.map((g) => g.name) ||
    (movie.genre_ids || []).map((id) => GENRES[id]).filter(Boolean);

  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${movie.title}`}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {data.backdrop_path && (
          <div className="modal-backdrop">
            <img
              src={getBackdropUrl(data.backdrop_path, "w1280")}
              alt=""
              aria-hidden="true"
              className="modal-backdrop-img"
            />
            <div className="modal-backdrop-gradient" />
          </div>
        )}

        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="modal-body">
          <div className="modal-poster-col">
            {data.poster_path ? (
              <img
                src={getPosterUrl(data.poster_path, "w500")}
                alt={`${data.title} poster`}
                className="modal-poster"
              />
            ) : (
              <div className="modal-poster-placeholder">🎬</div>
            )}
          </div>

          <div className="modal-info-col">
            {loading && <div className="modal-loading">Loading details…</div>}
            {error && <div className="modal-error">⚠ {error}</div>}

            <h2 className="modal-title">{data.title}</h2>
            {details?.tagline && <p className="modal-tagline">"{details.tagline}"</p>}

            <div className="modal-meta">
              <span className={`modal-rating ${ratingClass}`}>★ {rating}</span>
              <span className="modal-year">{year}</span>
              {runtime && <span className="modal-runtime">⏱ {runtime}</span>}
              {data.original_language && (
                <span className="modal-lang">{data.original_language.toUpperCase()}</span>
              )}
            </div>

            {genres.length > 0 && (
              <div className="modal-genres">
                {genres.map((g) => (
                  <span key={g} className="genre-tag">{g}</span>
                ))}
              </div>
            )}

            {data.overview && (
              <div className="modal-overview-section">
                <h4>Overview</h4>
                <p className="modal-overview">{data.overview}</p>
              </div>
            )}

            {details?.release_date && (
              <p className="modal-release">
                <strong>Release Date:</strong>{" "}
                {new Date(details.release_date).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            )}

            <button
              className={`modal-fav-btn ${favorite ? "active" : ""}`}
              onClick={() => toggleFavorite(movie)}
              aria-label={favorite ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {favorite ? "♥ In Watchlist" : "♡ Add to Watchlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}