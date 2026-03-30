import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './lib/AuthContext'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-center" toastOptions={{
          style: { background: '#131f2b', color: '#fff', border: '1px solid #1e2f40', borderRadius: '12px', fontSize: '14px' }
        }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
