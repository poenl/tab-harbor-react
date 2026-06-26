import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/styles/globals.css'
import '@/i18n'
import { ThemeProvider } from '@/stores/theme.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import Popup from './Popup.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <TooltipProvider disableHoverableContent>
        <Popup />
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>
)
