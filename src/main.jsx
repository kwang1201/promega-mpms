import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TooltipProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
    </TooltipProvider>
  </StrictMode>,
)
