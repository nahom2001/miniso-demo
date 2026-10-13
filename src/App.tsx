import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppRoutes } from './routes'
import { DemoControlBar } from '@/components/shared/DemoControlBar'
import { Toaster } from '@/components/ui/toast'
import { useUIStore } from '@/stores/uiStore'

export function App() {
  const { i18n } = useTranslation()
  const language = useUIStore((s) => s.language)

  // Sync language with i18n
  useEffect(() => {
    i18n.changeLanguage(language)
    document.documentElement.lang = language
    document.documentElement.dir = 'ltr' // both EN and AM use LTR
  }, [language, i18n])

  return (
    <>
      <AppRoutes />
      <DemoControlBar />
      <Toaster />
    </>
  )
}
