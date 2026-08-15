import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './components/Login'
import AddProductForm from './components/AddProductForm'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export default function App(){
  const [isAdmin, setIsAdmin] = useState(() => {
    return !!(localStorage.getItem('muteki_admin_token') || localStorage.getItem('adminToken'))
  })
  const [showAddProduct, setShowAddProduct] = useState(false)

  // Set initial axios Authorization header from stored token
  useEffect(() => {
    const token = localStorage.getItem('muteki_admin_token') || localStorage.getItem('adminToken')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setIsAdmin(true)
    }
  }, [])

  useEffect(() => {
    const onLogin = () => {
      const token = localStorage.getItem('muteki_admin_token') || localStorage.getItem('adminToken')
      if (token && !localStorage.getItem('muteki_admin_token')) {
        localStorage.setItem('muteki_admin_token', token)
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('muteki_admin_token') || localStorage.getItem('adminToken')}`
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
            {isAdmin && (
              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => setShowAddProduct(true)}>+ Ajouter un Produit</button>
            )}
            <Login />
            {isAdmin && (
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={logout}>Déconnecter</button>
            )}
          </div>
        </header>

        <main>
          {/* Your main app content goes here */}
        </main>

        <AddProductForm open={showAddProduct} onClose={() => setShowAddProduct(false)} />
      </div>
    </div>
  )
}
