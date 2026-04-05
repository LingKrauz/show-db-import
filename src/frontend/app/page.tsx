"use client";

import { FormEvent, useState, useMemo } from "react";
import Image from "next/image";
import { ScoreFormat, getScoreDisplay } from "@/app/utils/scoreFormat";

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

type SortOption = "title-asc" | "title-desc" | "score-asc" | "score-desc";
type ViewMode = "list" | "grid";

export default function Home() {
  const [username, setUsername] = useState("");
  const [shows, setShows] = useState<AnimeShow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("title-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setShows([]);
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

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full flex-col items-center justify-start gap-8 px-6 py-12 bg-white dark:bg-black md:justify-center md:py-32">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          AniList Show Finder
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              AniList Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your AniList username"
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-400"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? "Loading..." : "Find Completed Shows"}
          </button>
        </form>

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
            <div className="mb-4 flex justify-between items-center gap-4 flex-wrap">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                Completed Shows ({shows.length})
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
              <ol className="space-y-2 list-decimal list-inside">
                {sortedShows.map((show, index) => (
                  <li key={index} className="text-zinc-700 dark:text-zinc-300 break-words flex justify-between items-start">
                    <span className="flex-1">{show.title}</span>
                    {show.score && (
                      <span className="ml-4 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {getScoreDisplay(show.score, show.scoreFormat)}
                      </span>
                    )}
                  </li>
                ))}
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
                        className="w-full h-40 object-cover"
                        priority={false}
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
    </div>
  );
}
