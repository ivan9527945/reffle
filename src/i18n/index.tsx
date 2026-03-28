import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { en } from './en'
import { zhTW } from './zh-TW'

export type Locale = 'en' | 'zh-TW'

const LOCALES: Record<Locale, Record<string, string>> = { en, 'zh-TW': zhTW }
const STORAGE_KEY = 'btc-raffle-locale'

export type TFunc = (key: string, vars?: Record<string, string | number>) => string

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: TFunc
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (k) => k,
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    return saved && saved in LOCALES ? saved : 'en'
  })

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  const t: TFunc = useCallback(
    (key, vars) => {
      const dict = LOCALES[locale]
      let str = dict[key] ?? LOCALES['en'][key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{{${k}}}`, String(v))
        }
      }
      return str
    },
    [locale],
  )

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
