import React, { useState, useEffect } from 'react'
import Login from './components/Login'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export default function App(){
  const [isAdmin, setIsAdmin] = useState(() => {
    // Prefer the requested key muteki_admin_token, but accept existing adminToken for compatibility
    return !!(localStorage.getItem('muteki_admin_token') || localStorage.getItem('adminToken'))
  })

  useEffect(() => {
    const onLogin = () => {
      // If some code stored the token under `adminToken`, mirror it to `muteki_admin_token` for consistency
      const token = localStorage.getItem('muteki_admin_token') || localStorage.getItem('adminToken')
      if (token && !localStorage.getItem('muteki_admin_token')) {
        localStorage.setItem('muteki_admin_token', token)
      }
      setIsAdmin(true)
    }

    window.addEventListener('muteki:login', onLogin)
    return () => window.removeEventListener('muteki:login', onLogin)
  }, [])

  const onSellClick = () => {
    if (isAdmin) alert('Ouvre le form produit')
    else window.dispatchEvent(new Event('muteki:open-login'))
  }

  const logout = () => {
    localStorage.removeItem('muteki_admin_token')
    localStorage.removeItem('adminToken')
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-6">
      <div className="w-full max-w-4xl">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Muteki</h1>
          <div className="flex items-center gap-3">
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={onSellClick}>+ Vendre un Produit</button>
            <Login />
            {isAdmin && (
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={logout}>Déconnecter</button>
            )}
          </div>
        </header>

        <main>
          {/* Your main app content goes here */}
        </main>
      </div>
    </div>
  )
}
