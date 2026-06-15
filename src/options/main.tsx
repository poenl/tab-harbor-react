import React from 'react'
import ReactDOM from 'react-dom/client'
import OptionsPage from './App.tsx'
import '@/styles/globals.css'
import '@/i18n'
import { ThemeProvider } from '@/stores/theme.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <OptionsPage />
    </ThemeProvider>
  </React.StrictMode>
)
