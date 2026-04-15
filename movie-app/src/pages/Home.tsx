import { useState, useEffect, useCallback } from "react";
import type { Movie } from "../types/movie";
import { searchMovies, getTrendingMovies } from "../services/tmdb";
import { useDebounce } from "../hooks/useDebounce";
import { useFavorites } from "../context/FavoritesContext";
import { MovieCard } from "../components/MovieCard";
import { MovieModal } from "../components/MovieModal";
import { SearchBar } from "../components/SearchBar";
import { SkeletonGrid } from "../components/Skeleton";

type Tab = "discover" | "watchlist";

export default function Home() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [tab, setTab] = useState<Tab>("discover");
  const [totalResults, setTotalResults] = useState(0);

  const debouncedQuery = useDebounce(query, 450);
  const { favorites, clearFavorites } = useFavorites();

  // Load trending on mount
  useEffect(() => {
    setTrendingLoading(true);
    getTrendingMovies()
      .then((data) => setTrending(data.results))
      .catch(() => setTrending([]))
      .finally(() => setTrendingLoading(false));
  }, []);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setMovies([]);
      setTotalResults(0);
      return;
    }
    setLoading(true);
    setError("");
    searchMovies(debouncedQuery)
      .then((data) => {
        setMovies(data.results);
        setTotalResults(data.total_results);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleClear = useCallback(() => {
    setQuery("");
    setMovies([]);
    setTotalResults(0);
    setError("");
  }, []);

  const displayMovies = query.trim() ? movies : trending;
  const isSearching = !!query.trim();

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🎬</span>
            <span className="logo-text">CineFind</span>
          </div>
          <nav className="tab-nav" role="tablist">
            <button
              role="tab"
              aria-selected={tab === "discover"}
              className={`tab-btn ${tab === "discover" ? "active" : ""}`}
              onClick={() => setTab("discover")}
            >
              Discover
            </button>
            <button
              role="tab"
              aria-selected={tab === "watchlist"}
              className={`tab-btn ${tab === "watchlist" ? "active" : ""}`}
              onClick={() => setTab("watchlist")}
            >
              Watchlist
              {favorites.length > 0 && (
                <span className="tab-badge">{favorites.length}</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {/* Discover Tab */}
        {tab === "discover" && (
          <>
            <section className="hero-section">
              <h1 className="hero-title">Find Your Next <em>Obsession</em></h1>
              <p className="hero-sub">Search 500,000+ movies from The Movie Database</p>
              <SearchBar
                value={query}
                onChange={setQuery}
                onClear={handleClear}
                loading={loading}
                resultCount={isSearching ? totalResults : undefined}
              />
            </section>

            {error && (
              <div className="error-banner" role="alert">
                ⚠ {error} — Check your API key in <code>.env</code>
              </div>
            )}

            <section className="content-section">
              {!isSearching && (
                <h2 className="section-title">
                  <span className="section-title-accent">🔥</span> Trending This Week
                </h2>
              )}
              {isSearching && movies.length === 0 && !loading && !error && (
                <div className="empty-state">
                  <p>😕 No movies found for "<strong>{query}</strong>"</p>
                  <p>Try a different title or check your spelling.</p>
                </div>
              )}
              {(loading || trendingLoading) && !isSearching ? (
                <SkeletonGrid count={8} />
              ) : loading ? (
                <SkeletonGrid count={8} />
              ) : (
                <div className="movies-grid">
                  {displayMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={setSelectedMovie}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Watchlist Tab */}
        {tab === "watchlist" && (
          <section className="content-section watchlist-section">
            <div className="watchlist-header">
              <h2 className="section-title">
                <span className="section-title-accent">♥</span> My Watchlist
              </h2>
              {favorites.length > 0 && (
                <button
                  className="clear-btn"
                  onClick={clearFavorites}
                  aria-label="Clear all watchlist entries"
                >
                  Clear All
                </button>
              )}
            </div>

            {favorites.length === 0 ? (
              <div className="empty-state watchlist-empty">
                <div className="empty-icon">🍿</div>
                <h3>Your watchlist is empty</h3>
                <p>Browse movies and tap the heart to save them here.</p>
                <button className="goto-discover-btn" onClick={() => setTab("discover")}>
                  Discover Movies →
                </button>
              </div>
            ) : (
              <div className="movies-grid">
                {favorites.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={setSelectedMovie}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modal */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </>
  );
}