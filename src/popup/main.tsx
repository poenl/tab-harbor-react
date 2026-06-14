import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@/styles/globals.css'
import '@/i18n'
import { Button } from '@/components/ui/button.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Button>按钮</Button>
  </React.StrictMode>
)
