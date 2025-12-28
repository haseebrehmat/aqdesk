import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Reshaped } from 'reshaped'
import 'reshaped/themes/slate/theme.css'
import './theme-mono.css'
import './index.css'
import App from './App.jsx'
import { BrandingProvider } from './context/BrandingContext'

function initialColorMode() {
  try {
    const stored = localStorage.getItem('__reshaped-mode')
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* storage unavailable */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Reshaped theme="slate" defaultColorMode={initialColorMode()}>
      <BrandingProvider>
        <App />
      </BrandingProvider>
    </Reshaped>
  </StrictMode>,
)
