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
    <div className="flex min-h-screen flex-col bg-[#07091a] font-sans">
      {isCompact ? (
        <header className="sticky top-0 z-10 bg-[#0e1230]/80 backdrop-blur-md border-b border-purple-900/30 px-4 py-3 shadow-lg sm:px-6">
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
                className="w-full min-w-0 rounded-full border border-purple-800/50 bg-[#0a0f2e] px-4 py-1.5 text-[#f1f5f9] placeholder-[#64748b] focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 sm:flex-1 transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full rounded-full bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-1.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto whitespace-nowrap"
              >
                {loading ? "Loading..." : (
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
              <span className="text-[#f1f5f9]">Intelligently.</span>
            </h1>
            <p className="text-[#94a3b8] text-lg leading-relaxed max-w-md">
              Enter your AniList username to browse your completed anime and get AI-powered recommendations tailored to your taste.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium text-[#94a3b8]">
                AniList Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. username123"
                className="w-full rounded-xl border border-purple-800/50 bg-[#0e1230] px-4 py-3 text-[#f1f5f9] placeholder-[#475569] focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Find Completed Shows"}
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

          {shows.length > 0 && (
            <div className="w-full max-w-6xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#f1f5f9]">
                  Based on what you like, you may enjoy:
                </h2>
                {!recFetched && (
                  <button
                    onClick={handleGetRecommendations}
                    disabled={recLoading}
                    className="rounded-full bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {recLoading ? "Thinking..." : "Get AI Recommendations"}
                  </button>
                )}
              </div>

              {recError && (
                <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-4 mb-4">
                  <p className="text-red-300">Error: {recError}</p>
                </div>
              )}

              {recLoading && (
                <div className="flex items-center gap-3 text-[#94a3b8]">
                  <svg className="animate-spin h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Analyzing your watch history...</span>
                </div>
              )}

              {recFetched && recommendations.length === 0 && !recError && (
                <p className="text-[#64748b]">No recommendations returned.</p>
              )}

              {recommendations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      onClick={() => handleOpenAniList(rec.aniListId)}
                      className={`relative rounded-xl border border-purple-800/40 bg-[#130d2a] overflow-hidden transition-all hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] ${rec.aniListId ? "cursor-pointer" : ""}`}
                    >
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
                        <div className="w-full h-40 bg-purple-950/50 flex items-center justify-center">
                          <span className="text-purple-500/60 text-sm">No image</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-[#f1f5f9] line-clamp-2 mb-2">
                          {rec.title}
                        </h3>
                        <p className="text-sm text-[#94a3b8]">{rec.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {shows.length > 0 && (
            <div className="w-full max-w-6xl overflow-x-hidden">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-[#f1f5f9]">
                  Your Shows ({shows.length})
                </h2>
                <div className="w-full flex flex-wrap items-center justify-end gap-3 sm:w-auto">
                  <div className="flex flex-wrap gap-1 rounded-xl border border-purple-900/40 bg-[#0e1230] p-1">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === "list"
                          ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                          : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-purple-900/20"
                      }`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === "grid"
                          ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                          : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-purple-900/20"
                      }`}
                    >
                      Grid
                    </button>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full min-w-0 rounded-xl border border-purple-900/40 bg-[#0e1230] px-3 py-1.5 text-sm text-[#f1f5f9] focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 sm:w-auto sm:min-w-[12rem]"
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
                        className="absolute w-full text-[#94a3b8] break-words flex justify-between items-start"
                        style={{
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start - listVirtualizer.options.scrollMargin}px)`,
                        }}
                      >
                        <span className="flex-1">{show.title}</span>
                        {show.score && (
                          <span className="ml-4 font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
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
                      className={`rounded-xl border border-purple-900/30 bg-[#0e1230] overflow-hidden transition-all hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.12)] ${show.aniListId ? "cursor-pointer" : ""}`}
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
                        <div className="w-full h-40 bg-[#0a0f2e] flex items-center justify-center">
                          <span className="text-[#475569] text-sm">No image</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-[#f1f5f9] line-clamp-2 mb-3">
                          {show.title}
                        </h3>
                        {show.score ? (
                          <div className="text-sm text-[#94a3b8]">
                            Score:{" "}
                            <span className="font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                              {getScoreDisplay(show.score, show.scoreFormat)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-[#475569]">No score</div>
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
