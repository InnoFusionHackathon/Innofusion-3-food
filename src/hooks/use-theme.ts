import { useEffect, useState } from "react";

const KEY = "sfqr_theme";

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as "dark" | "light" | null;
    const initial = stored ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return { theme, toggle };
}
