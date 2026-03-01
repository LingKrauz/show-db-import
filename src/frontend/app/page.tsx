"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [utcTime, setUtcTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5132";

    fetch(`${apiUrl}/api/timer`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { utcTime: string }) => {
        setUtcTime(data.utcTime);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-16 py-32 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Server Time
        </h1>
        {loading && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Loading...
          </p>
        )}
        {error && (
          <p className="text-lg text-red-500">
            Error: {error}
          </p>
        )}
        {utcTime && (
          <p className="text-2xl font-mono text-zinc-800 dark:text-zinc-200">
            {utcTime}
          </p>
        )}
      </main>
    </div>
  );
}
