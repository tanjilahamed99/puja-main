// lib/useFreeClass.js
"use client";

import { useEffect, useState } from "react";
import { browseFreeClasses } from "@/action/student";

// There's no GET /student/free-classes/:id endpoint yet — only the list —
// so this fetches the full list and finds the matching one. Shared by the
// room page and the donation page so that workaround lives in one place.
export function useFreeClass(id) {
  const [freeClass, setFreeClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);
      try {
        const { data } = await browseFreeClasses();
        if (!active) return;
        const match = (data.freeClasses || []).find((c) => c._id === id);
        if (!match) {
          setNotFound(true);
        } else {
          setFreeClass(match);
        }
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.message ||
            "Could not load this class. Please try again.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id]);

  return { freeClass, loading, notFound, error };
}
