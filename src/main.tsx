import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configureAuthHttpClient } from '@features/auth'
import './app/styles/index.css'
import App from './app/App'

configureAuthHttpClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
