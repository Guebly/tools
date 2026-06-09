import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('guebly-theme')
    return (saved === 'light' ? 'light' : 'dark') as Theme
  })

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'light') {
      html.classList.remove('dark')
      html.classList.add('light-tool')
    } else {
      html.classList.remove('light-tool')
      html.classList.add('dark')
    }
    localStorage.setItem('guebly-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
