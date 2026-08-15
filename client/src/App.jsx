import React, { useState } from 'react'
import AdminProducts from './components/AdminProducts'
import Search from './components/Search'
import Login from './components/Login'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export default function App(){
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('muteki_user')) } catch(e){ return null }
  })
  const [adminOpen, setAdminOpen] = useState(false)

  React.useEffect(() => {
    if(user) localStorage.setItem('muteki_user', JSON.stringify(user))
    else localStorage.removeItem('muteki_user')
  }, [user])

  return (
    <div className="min-h-screen flex items-start justify-center p-6">
      <div className="w-full max-w-4xl">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Muteki</h1>
          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Connecté: {user.phone}</span>
                <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={()=>setUser(null)}>Déconnecter</button>
                <button className="bg-gray-800 text-white px-3 py-1 rounded" onClick={()=>setAdminOpen(v=>!v)}>{adminOpen? 'Retour' : 'Admin'}</button>
              </div>
            ) : (
              <Login onLogin={u => setUser(u)} />
            )}
          </div>
        </header>

        <main>
          {adminOpen ? (
            <AdminProducts />
          ) : (
            <Search apiBase={API_BASE} />
          )}
        </main>
      </div>
    </div>
  )
}
