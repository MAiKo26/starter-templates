import { create } from "zustand"

interface ThemeState {
  theme: "light" | "dark" | "system"
  resolvedTheme: "light" | "dark"
  setTheme: (theme: "light" | "dark" | "system") => void
  toggleTheme: () => void
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getInitialTheme(): "light" | "dark" | "system" {
  if (typeof window === "undefined") return "system"
  const stored = localStorage.getItem("theme") as
    | "light"
    | "dark"
    | "system"
    | null
  return stored ?? "system"
}

function applyTheme(theme: "light" | "dark" | "system") {
  const resolved = theme === "system" ? getSystemTheme() : theme
  document.documentElement.classList.toggle("dark", resolved === "dark")
  return resolved
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = getInitialTheme()
  const resolvedTheme = applyTheme(initialTheme)

  return {
    theme: initialTheme,
    resolvedTheme,
    setTheme: (theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", theme)
      }
      const resolved = applyTheme(theme)
      set({ theme, resolvedTheme: resolved })
    },
    toggleTheme: () => {
      const current = get().theme
      const next = current === "dark" ? "light" : "dark"
      get().setTheme(next)
    },
  }
})

if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.addEventListener("change", () => {
    const store = useThemeStore.getState()
    if (store.theme === "system") {
      const resolved = getSystemTheme()
      document.documentElement.classList.toggle("dark", resolved === "dark")
      useThemeStore.setState({ resolvedTheme: resolved })
    }
  })
}
