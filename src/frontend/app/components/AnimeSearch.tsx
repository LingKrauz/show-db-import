"use client";

import { FormEvent, useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { ScoreFormat, getScoreDisplay } from "@/app/utils/scoreFormat";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

interface AnimeShow {
  title: string;
  status: string;
  score: number | null;
  scoreFormat: ScoreFormat;
  coverImageUrl: string | null;
  aniListId: number | null;
}

interface AnimeResponse {
  shows: AnimeShow[];
  error?: string;
}

interface Recommendation {
  title: string;
  reason: string;
  aniListId: number | null;
  coverImageUrl: string | null;
}

interface RecommendationResponse {
  recommendations: Recommendation[];
}

type SortOption = "title-asc" | "title-desc" | "score-asc" | "score-desc";
type ViewMode = "list" | "grid";

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? "h-4 w-4"}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function AnimeSearch() {
  const [username, setUsername] = useState("");
  const [shows, setShows] = useState<AnimeShow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("score-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterText, setFilterText] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recFetched, setRecFetched] = useState(false);
  const [columns, setColumns] = useState(4);
  const [showSlowLoad, setShowSlowLoad] = useState(false);

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w >= 1280) setColumns(4);
      else if (w >= 1024) setColumns(3);
      else if (w >= 640) setColumns(2);
      else setColumns(1);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const listRef = useRef<HTMLOListElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [listScrollMargin, setListScrollMargin] = useState(0);
  const [gridScrollMargin, setGridScrollMargin] = useState(0);

  useEffect(() => {
    if (listRef.current) setListScrollMargin(listRef.current.offsetTop);
  }, [shows, filterText]);

  useEffect(() => {
    if (gridRef.current) setGridScrollMargin(gridRef.current.offsetTop);
  }, [shows, columns, filterText]);

  useEffect(() => {
    if (!loading) {
      setShowSlowLoad(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowLoad(true), 30000);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setShows([]);
    setRecommendations([]);
    setRecError(null);
    setRecFetched(false);
    setLoading(true);
    setSubmitted(false);
    setSortBy("score-desc");
    setFilterText("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5132";
      const res = await fetch(`${apiUrl}/api/anime/completed/${encodeURIComponent(username)}`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: AnimeResponse = await res.json();
      const fetchedShows = data.shows || [];
      setShows(fetchedShows);
      setSubmitted(true);
      if (fetchedShows.length > 0) {
        handleGetRecommendations();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch anime list");
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setRecLoading(true);
    setRecError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5132";
      const res = await fetch(`${apiUrl}/api/recommendations/${encodeURIComponent(username)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: RecommendationResponse = await res.json();
      setRecommendations(data.recommendations || []);
      setRecFetched(true);
    } catch (err) {
      setRecError(err instanceof Error ? err.message : "Failed to get recommendations");
    } finally {
      setRecLoading(false);
    }
  };

  const sortedShows = useMemo(() => {
    const sorted = [...shows];

    switch (sortBy) {
      case "title-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "score-asc":
        sorted.sort((a, b) => {
          if (a.score === null && b.score === null) return 0;
          if (a.score === null) return 1;
          if (b.score === null) return -1;
          return a.score - b.score;
        });
        break;
      case "score-desc":
        sorted.sort((a, b) => {
          if (a.score === null && b.score === null) return 0;
          if (a.score === null) return 1;
          if (b.score === null) return -1;
          return b.score - a.score;
        });
        break;
    }

    return sorted;
  }, [shows, sortBy]);

  const filteredShows = useMemo(() => {
    if (!filterText.trim()) return sortedShows;
    const lower = filterText.toLowerCase();
    return sortedShows.filter((show) => show.title.toLowerCase().includes(lower));
  }, [sortedShows, filterText]);

  const gridRows = useMemo(() => {
    const rows: AnimeShow[][] = [];
    for (let i = 0; i < filteredShows.length; i += columns) {
      rows.push(filteredShows.slice(i, i + columns));
    }
    return rows;
  }, [filteredShows, columns]);

  const listVirtualizer = useWindowVirtualizer({
    count: filteredShows.length,
    estimateSize: () => 40,
    overscan: 10,
    scrollMargin: listScrollMargin,
  });

  // Each row is ~280px card + 16px bottom gap
  const gridVirtualizer = useWindowVirtualizer({
    count: gridRows.length,
    estimateSize: () => 296,
    overscan: 2,
    scrollMargin: gridScrollMargin,
  });

  const isCompact = loading || submitted || !!error;

  return (
    <div className="flex flex-col flex-1 font-sans">
      {isCompact ? (
        <header className="sticky top-0 z-10 bg-bg-surface/80 backdrop-blur-md border-b border-purple-300/40 dark:border-purple-900/30 px-4 py-3 shadow-lg sm:px-6">
          <div className="flex w-full items-center gap-3">
            <h1 className="shrink-0 text-lg font-bold tracking-tight sm:text-xl">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AniList Finder
              </span>
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 sm:max-w-lg">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your AniList username"
                className="w-full min-w-0 rounded-full border border-purple-400/40 dark:border-purple-800/50 bg-bg-input px-4 py-1.5 text-fg-primary placeholder-fg-muted focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 sm:flex-1 transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full rounded-full bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-1.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto whitespace-nowrap inline-flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Spinner className="h-3.5 w-3.5" />
                    Loading...
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Find</span>
                    <span className="hidden sm:inline">Find Shows</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </header>
      ) : (
        <header className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-20 sm:px-6">
          <div className="flex flex-col items-center gap-5 text-center max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
                Find What to Watch Next,
              </span>
              <br />
              <span className="text-fg-primary">Intelligently.</span>
            </h1>
            <p className="text-fg-secondary text-lg leading-relaxed max-w-md">
              Enter your AniList username to browse your completed anime and get AI-powered recommendations tailored to your taste.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium text-fg-secondary">
                AniList Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. username123"
                className="w-full rounded-xl border border-purple-400/40 dark:border-purple-800/50 bg-bg-surface px-4 py-3 text-fg-primary placeholder-fg-placeholder focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner />
                  Loading...
                </>
              ) : "Find Completed Shows"}
            </button>
          </form>
        </header>
      )}

      {isCompact && (
        <main className="flex w-full flex-col items-center gap-10 px-4 py-10 sm:px-6">

          {error && (
            <div className="w-full max-w-md rounded-xl border border-red-900/40 bg-red-950/30 p-4">
              <p className="text-red-300">Error: {error}</p>
            </div>
          )}

          {submitted && shows.length === 0 && !error && (
            <div className="w-full max-w-md rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
              <p className="text-amber-300">No completed shows found for this user.</p>
            </div>
          )}

          {/* Skeleton loading state */}
          {loading && (
            <div className="w-full max-w-6xl">
              <div className="mb-4 h-5 w-52 rounded-lg bg-purple-200/40 dark:bg-purple-900/30 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-purple-300/40 dark:border-purple-900/30 bg-bg-surface overflow-hidden animate-pulse">
                    <div className="w-full h-40 bg-purple-200/30 dark:bg-purple-900/20" />
                    <div className="p-4 flex flex-col gap-2">
                      <div className="h-4 bg-purple-200/40 dark:bg-purple-900/30 rounded w-3/4" />
                      <div className="h-4 bg-purple-200/40 dark:bg-purple-900/30 rounded w-1/2" />
                      <div className="h-3 bg-purple-200/30 dark:bg-purple-900/20 rounded w-1/4 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
              {showSlowLoad && (
                <p className="mt-6 text-center text-sm text-fg-secondary">
                  Please wait, services are starting up. If not loaded in 30 seconds, refresh the page and try again.
                </p>
              )}
            </div>
          )}

          {shows.length > 0 && (
            <>
              {/* Result summary */}
              <p className="w-full max-w-6xl text-sm text-fg-secondary">
                Found{" "}
                <span className="font-semibold text-fg-primary">{shows.length}</span>{" "}
                completed shows for{" "}
                <span className="font-semibold text-purple-400">@{username}</span>
              </p>

              {/* Recommendations section */}
              <div className="w-full max-w-6xl">
                {recLoading && (
                  <div className="flex items-center gap-3 text-fg-secondary py-4">
                    <Spinner className="h-5 w-5 text-purple-400" />
                    <span>Analyzing your watch history...</span>
                  </div>
                )}

                {recError && (
                  <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-4">
                    <p className="text-red-300">Error: {recError}</p>
                  </div>
                )}

                {recFetched && recommendations.length === 0 && !recError && (
                  <p className="text-fg-muted">No recommendations returned.</p>
                )}

                {recommendations.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-fg-primary mb-4">Based on your watch history</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {recommendations.map((rec, index) => {
                        const cardClasses =
                          "relative flex flex-col rounded-xl border border-purple-400/50 dark:border-purple-700/50 bg-bg-card overflow-hidden transition-all hover:border-purple-500/70 hover:shadow-[0_0_24px_rgba(124,58,237,0.22)] focus:outline-none focus:ring-2 focus:ring-purple-500/50";
                        const inner = (
                          <>
                            {/* Gradient top-border accent */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 z-10" />
                            <span className="absolute top-2 right-2 z-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                              AI
                            </span>
                            {rec.coverImageUrl ? (
                              <Image
                                src={rec.coverImageUrl}
                                alt={rec.title}
                                width={225}
                                height={320}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                className="w-full h-40 object-cover"
                                placeholder="empty"
                              />
                            ) : (
                              <div className="w-full h-40 bg-purple-200/40 dark:bg-purple-950/50 flex items-center justify-center">
                                <span className="text-purple-500/60 text-sm">No image</span>
                              </div>
                            )}
                            <div className="flex flex-col flex-1 p-4">
                              <h3 className="font-semibold text-fg-primary line-clamp-2 mb-2">{rec.title}</h3>
                              <p className="text-sm text-fg-secondary line-clamp-3">{rec.reason}</p>
                            </div>
                          </>
                        );
                        return rec.aniListId ? (
                          <a
                            key={index}
                            href={`https://anilist.co/anime/${rec.aniListId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cardClasses}
                          >
                            {inner}
                          </a>
                        ) : (
                          <div key={index} className={cardClasses}>{inner}</div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Shows section */}
              <div className="w-full max-w-6xl overflow-x-hidden">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-fg-primary">
                    Your Shows ({shows.length})
                  </h2>
                  <div className="w-full flex flex-wrap items-center justify-end gap-3 sm:w-auto">
                    <input
                      type="text"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder="Filter by title…"
                      className="w-full min-w-0 rounded-xl border border-purple-300/50 dark:border-purple-900/40 bg-bg-surface px-3 py-1.5 text-sm text-fg-primary placeholder-fg-placeholder focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 sm:w-auto sm:min-w-[12rem] transition-colors"
                    />
                    <div className="flex gap-1 rounded-xl border border-purple-300/50 dark:border-purple-900/40 bg-bg-surface p-1">
                      <button
                        onClick={() => setViewMode("list")}
                        aria-label="List view"
                        title="List view"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === "list"
                              ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                              : "text-fg-secondary hover:text-fg-primary hover:bg-purple-200/30 dark:hover:bg-purple-900/20"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                          <path fillRule="evenodd" d="M2 4a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                        </svg>
                        List
                      </button>
                      <button
                        onClick={() => setViewMode("grid")}
                        aria-label="Grid view"
                        title="Grid view"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === "grid"
                              ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                              : "text-fg-secondary hover:text-fg-primary hover:bg-purple-200/30 dark:hover:bg-purple-900/20"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                          <path d="M3 3h4v4H3V3Zm6 0h4v4H9V3ZM3 9h4v4H3V9Zm6 0h4v4H9V9Z" />
                        </svg>
                        Grid
                      </button>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full min-w-0 rounded-xl border border-purple-300/50 dark:border-purple-900/40 bg-bg-surface px-3 py-1.5 text-sm text-fg-primary focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 sm:w-auto sm:min-w-[12rem]"
                    >
                      <option value="title-asc">Sort: Title (A-Z)</option>
                      <option value="title-desc">Sort: Title (Z-A)</option>
                      <option value="score-asc">Sort: Score (Low to High)</option>
                      <option value="score-desc">Sort: Score (High to Low)</option>
                    </select>
                  </div>
                </div>

                {filterText.trim() && (
                  <p className="mb-3 text-sm text-fg-secondary">
                    Showing{" "}
                    <span className="font-semibold text-fg-primary">{filteredShows.length}</span>{" "}
                    of {shows.length}
                  </p>
                )}

                {filterText.trim() && filteredShows.length === 0 && (
                  <p className="text-sm text-fg-muted">No shows match your filter.</p>
                )}

                {viewMode === "list" ? (
                  <ol
                    ref={listRef}
                    className="relative list-decimal list-inside"
                    style={{ height: `${listVirtualizer.getTotalSize()}px` }}
                  >
                    {listVirtualizer.getVirtualItems().map((virtualItem) => {
                      const show = filteredShows[virtualItem.index];
                      return (
                        <li
                          key={virtualItem.index}
                          className="absolute w-full text-fg-secondary break-words flex justify-between items-start"
                          style={{
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start - listVirtualizer.options.scrollMargin}px)`,
                          }}
                        >
                          {show.aniListId ? (
                            <a
                              href={`https://anilist.co/anime/${show.aniListId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 hover:text-purple-300 transition-colors"
                            >
                              {show.title}
                            </a>
                          ) : (
                            <span className="flex-1">{show.title}</span>
                          )}
                          {show.score !== null && (
                            <span className="ml-4 font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                              {getScoreDisplay(show.score, show.scoreFormat)}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <div
                    ref={gridRef}
                    className="relative"
                    style={{ height: `${gridVirtualizer.getTotalSize()}px` }}
                  >
                    {gridVirtualizer.getVirtualItems().map((virtualRow) => {
                      const rowShows = gridRows[virtualRow.index];
                      return (
                        <div
                          key={virtualRow.index}
                          className="absolute w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 pb-4"
                          style={{
                            transform: `translateY(${virtualRow.start - gridVirtualizer.options.scrollMargin}px)`,
                          }}
                        >
                          {rowShows.map((show, colIdx) => {
                            const cardClasses =
                              "flex flex-col rounded-xl border border-purple-300/40 dark:border-purple-900/30 bg-bg-surface overflow-hidden transition-all hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.12)] focus:outline-none focus:ring-2 focus:ring-purple-500/40";
                            const inner = (
                              <>
                                {show.coverImageUrl ? (
                                  <Image
                                    src={show.coverImageUrl}
                                    alt={show.title}
                                    width={225}
                                    height={320}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                    className="w-full h-40 object-cover"
                                    placeholder="empty"
                                  />
                                ) : (
                                  <div className="w-full h-40 bg-bg-input flex items-center justify-center">
                                    <span className="text-fg-placeholder text-sm">No image</span>
                                  </div>
                                )}
                                <div className="flex flex-col flex-1 p-4">
                                  <h3 className="font-semibold text-fg-primary line-clamp-2 mb-3">
                                    {show.title}
                                  </h3>
                                  <div className="text-sm">
                                    {show.score !== null ? (
                                      <span className="text-fg-secondary">
                                        Score:{" "}
                                        <span className="font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                          {getScoreDisplay(show.score, show.scoreFormat)}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="text-fg-placeholder">—</span>
                                    )}
                                  </div>
                                </div>
                              </>
                            );
                            return show.aniListId ? (
                              <a
                                key={colIdx}
                                href={`https://anilist.co/anime/${show.aniListId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cardClasses}
                              >
                                {inner}
                              </a>
                            ) : (
                              <div key={colIdx} className={cardClasses}>{inner}</div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

        </main>
      )}
    </div>
  );
}
