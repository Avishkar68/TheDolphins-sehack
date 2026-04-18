import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Workaround for react-force-graph library bug: stubs AFRAME to prevent initialization crash
if (typeof window !== 'undefined') {
  window.AFRAME = window.AFRAME || {};
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
