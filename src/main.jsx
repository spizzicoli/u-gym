import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './lib/firebase'
import { SplashScreen } from '@capacitor/splash-screen'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister())
  })
  if ('caches' in window) {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)))
  }
}

// Mostra la splash e NON nasconderla automaticamente
SplashScreen.show({
  autoHide: false,
})

// Nascondi dopo 3 secondi
setTimeout(() => {
  SplashScreen.hide()
}, 3000)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
