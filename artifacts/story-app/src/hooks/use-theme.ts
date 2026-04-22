import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const HASH_KEY = "theme";

function parseHashParams(): URLSearchParams {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash);
}

function readThemeFromHash(): Theme | null {
  try {
    const params = parseHashParams();
    const v = params.get(HASH_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {}
  return null;
}

function writeThemeToHash(theme: Theme): void {
  const params = parseHashParams();
  params.set(HASH_KEY, theme);
  const newHash = params.toString();
  const url = `${window.location.pathname}${window.location.search}#${newHash}`;
  window.history.replaceState(null, "", url);
}

function detectInitial(): Theme {
  const fromHash = readThemeFromHash();
  if (fromHash) return fromHash;
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof window === "undefined" ? "light" : detectInitial(),
  );

  useEffect(() => {
    applyTheme(theme);
    writeThemeToHash(theme);
  }, [theme]);

  useEffect(() => {
    const onHashChange = () => {
      const fromHash = readThemeFromHash();
      if (fromHash && fromHash !== theme) setThemeState(fromHash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((p) => (p === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, setTheme, toggleTheme };
}
