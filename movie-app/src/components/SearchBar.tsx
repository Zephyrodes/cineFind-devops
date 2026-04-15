import { useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  loading?: boolean;
  resultCount?: number;
}

export function SearchBar({ value, onChange, onClear, loading, resultCount }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="search-wrapper" role="search">
      <div className="search-bar">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          placeholder="Search movies, directors, genres…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Search movies"
          autoComplete="off"
          autoFocus
        />
        {loading && <span className="search-spinner" aria-hidden="true" />}
        {value && !loading && (
          <button
            className="search-clear"
            onClick={() => { onClear(); inputRef.current?.focus(); }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {value && !loading && resultCount !== undefined && (
        <p className="search-count" aria-live="polite">
          {resultCount === 0 ? "No results found" : `${resultCount} movies found`}
        </p>
      )}
    </div>
  );
}