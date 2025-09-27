import { useState } from "react";

const AUTH_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

async function getClerkTokenSafely() {
  if (!AUTH_ENABLED) return null;
  try {
    const clerk = typeof window !== "undefined" ? window.Clerk : undefined;
    if (clerk?.session?.getToken) {
      return await clerk.session.getToken({ template: "supabase" });
    }
  } catch (_) {
    // ignore; fall through to null token
  }
  return null;
}

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const supabaseAccessToken = await getClerkTokenSafely();
      const response = await cb(supabaseAccessToken, ...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn };
};

export default useFetch;
