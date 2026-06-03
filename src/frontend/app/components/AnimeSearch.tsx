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

export default function AnimeSearch() {
  const [username, setUsername] = useState("");
  const [shows, setShows] = useState<AnimeShow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("title-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recFetched, setRecFetched] = useState(false);

  const listRef = useRef<HTMLOListElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    if (listRef.current) {
      setScrollMargin(listRef.current.offsetTop);
    }
  }, [shows]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setShows([]);
    setRecommendations([]);
    setRecError(null);
    setRecFetched(false);
    setLoading(true);
    setSubmitted(false);
    setSortBy("title-asc");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5132";
      const res = await fetch(`${apiUrl}/api/anime/completed/${encodeURIComponent(username)}`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: AnimeResponse = await res.json();
      setShows(data.shows || []);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch anime list");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAniList = (aniListId: number | null) => {
    if (aniListId) {
      window.open(`https://anilist.co/anime/${aniListId}`, "_blank");
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

  const listVirtualizer = useWindowVirtualizer({
    count: sortedShows.length,
    estimateSize: () => 40,
    overscan: 10,
    scrollMargin,
  });

  const isCompact = loading || submitted || !!error;

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans dark:bg-black">
      <header className={
        isCompact
          ? "sticky top-0 z-10 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 shadow-sm sm:px-6"
          : "flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 sm:px-6"
      }>
        <h1 className={
          isCompact
            ? "text-lg font-semibold tracking-tight text-black dark:text-zinc-50 shrink-0 sm:text-xl"
            : "text-3xl font-semibold tracking-tight text-black dark:text-zinc-50"
        }>
          AniList Show Finder
        </h1>

        <form onSubmit={handleSubmit} className={
          isCompact
            ? "flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 sm:flex-1 sm:max-w-lg"
            : "w-full max-w-md flex flex-col gap-4"
        }>
          {!isCompact && (
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                AniList Username
              </label>
            </div>
          )}
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your AniList username"
            className={`w-full min-w-0 rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-zinc-900 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-400 ${isCompact ? "py-1.5 sm:flex-1" : "py-2"}`}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className={`w-full rounded-lg bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 sm:w-auto ${isCompact ? "px-4 py-1.5 whitespace-nowrap" : "px-4 py-2"}`}
          >
            {loading ? "Loading..." : <>
              <span className="sm:hidden">Find</span>
              <span className="hidden sm:inline">Find Completed Shows</span>
            </>}
          </button>
        </form>
      </header>

      {isCompact && (
      <main className="flex w-full flex-col items-center gap-8 px-4 py-8 bg-white dark:bg-black sm:px-6">

        {error && (
          <div className="w-full max-w-md rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="text-red-800 dark:text-red-200">
              Error: {error}
            </p>
          </div>
        )}

        {submitted && shows.length === 0 && !error && (
          <div className="w-full max-w-md rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <p className="text-amber-800 dark:text-amber-200">
              No completed shows found for this user.
            </p>
          </div>
        )}

        {shows.length > 0 && (
          <div className="w-full max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                Based on what you like, you may enjoy:
              </h2>
              {!recFetched && (
                <button
                  onClick={handleGetRecommendations}
                  disabled={recLoading}
                  className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-purple-500 dark:hover:bg-purple-600"
                >
                  {recLoading ? "Thinking..." : "Get AI Recommendations"}
                </button>
              )}
            </div>

            {recError && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <p className="text-red-800 dark:text-red-200">Error: {recError}</p>
              </div>
            )}

            {recLoading && (
              <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Analyzing your watch history...</span>
              </div>
            )}

            {recFetched && recommendations.length === 0 && !recError && (
              <p className="text-zinc-500 dark:text-zinc-400">No recommendations returned.</p>
            )}

            {recommendations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    onClick={() => handleOpenAniList(rec.aniListId)}
                    className={`rounded-lg border border-purple-200 bg-purple-50 overflow-hidden dark:border-purple-800 dark:bg-purple-950 hover:shadow-md transition-shadow ${rec.aniListId ? "cursor-pointer" : ""}`}
                  >
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
                      <div className="w-full h-40 bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <span className="text-purple-400 dark:text-purple-500 text-sm">No image</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-2 mb-2">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{rec.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {shows.length > 0 && (
          <div className="w-full max-w-6xl">
            <div className="mb-4 flex justify-between items-center gap-4 flex-wrap">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                Your Shows ({shows.length})
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-2 border border-zinc-300 rounded-lg p-1 dark:border-zinc-600">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    Grid
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 focus:border-zinc-600 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
                >
                  <option value="title-asc">Sort: Title (A-Z)</option>
                  <option value="title-desc">Sort: Title (Z-A)</option>
                  <option value="score-asc">Sort: Score (Low to High)</option>
                  <option value="score-desc">Sort: Score (High to Low)</option>
                </select>
              </div>
            </div>

            {viewMode === "list" ? (
              <ol
                ref={listRef}
                className="relative list-decimal list-inside"
                style={{ height: `${listVirtualizer.getTotalSize()}px` }}
              >
                {listVirtualizer.getVirtualItems().map((virtualItem) => {
                  const show = sortedShows[virtualItem.index];
                  return (
                    <li
                      key={virtualItem.index}
                      className="absolute w-full text-zinc-700 dark:text-zinc-300 break-words flex justify-between items-start"
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start - listVirtualizer.options.scrollMargin}px)`,
                      }}
                    >
                      <span className="flex-1">{show.title}</span>
                      {show.score && (
                        <span className="ml-4 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {getScoreDisplay(show.score, show.scoreFormat)}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedShows.map((show, index) => (
                  <div
                    key={index}
                    onClick={() => handleOpenAniList(show.aniListId)}
                    className={`rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden dark:border-zinc-700 dark:bg-zinc-900 hover:shadow-md transition-shadow ${show.aniListId ? "cursor-pointer" : ""}`}
                  >
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
                      <div className="w-full h-40 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-500 dark:text-zinc-500 text-sm">No image</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-2 mb-3">
                        {show.title}
                      </h3>
                      {show.score && (
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          Score: <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {getScoreDisplay(show.score, show.scoreFormat)}
                          </span>
                        </div>
                      )}
                      {!show.score && (
                        <div className="text-sm text-zinc-500 dark:text-zinc-500">
                          No score
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
      )}
    </div>
  );
}
