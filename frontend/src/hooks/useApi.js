import { useState, useCallback } from "react";

const TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function friendlyError(err) {
  if (err.name === "AbortError") return "Request timed out. Is the backend running?";
  if (err.message === "Failed to fetch") return "Cannot connect to the server. Please try again in a moment.";
  return err.message;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const get = useCallback(async (url, retries = MAX_RETRIES) => {
    setLoading(true);
    setError(null);
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetchWithTimeout(url);
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setLoading(false);
        return data;
      } catch (err) {
        if (attempt === retries) {
          setError(friendlyError(err));
          setLoading(false);
          return null;
        }
        // Brief pause before retry
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }, []);

  const post = useCallback(async (url, body) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      setError(friendlyError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { get, post, loading, error, clearError };
}
