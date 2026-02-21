import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HeroUIProvider>
      <ToastProvider placement="bottom-right" toastOffset={20} />
      <App />
    </HeroUIProvider>
  </StrictMode>,
)
