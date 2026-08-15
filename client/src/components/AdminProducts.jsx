import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ProductEditor from './ProductEditor'

export default function AdminProducts(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)

  const token = localStorage.getItem('muteki_admin_token')
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

  const fetchProducts = async () => {
    setLoading(true)
    try{
      const res = await axios.get('/api/products')
      setProducts(res.data)
    }catch(e){ console.error(e) }
    setLoading(false)
  }

  useEffect(()=>{ fetchProducts() }, [])

  const onDelete = async (id) => {
    if(!confirm('Supprimer ce produit ?')) return
    try{
      await axios.delete('/api/products-delete', { data: { id } })
      fetchProducts()
    }catch(e){ alert('Erreur suppression') }
  }

  const onSaved = () => { setEditing(null); fetchProducts() }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Admin — Produits</h2>
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={()=>setEditing({})}>Nouveau produit</button>
      </div>

      {editing && <div className="mb-4"><ProductEditor product={editing} onSaved={onSaved} onCancel={()=>setEditing(null)} /></div>}

      {loading ? <div>Chargement...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white border rounded-lg p-3 flex flex-col">
              {p.image ? <img src={p.image} alt={p.title} className="w-full h-40 object-cover rounded" /> : <div className="w-full h-40 bg-gray-100 rounded" />}
              <h3 className="mt-2 font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-600">Vendeur: {p.vendeur} • {p.location}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="font-bold">{Intl.NumberFormat('fr-FR', {style:'currency', currency:p.currency||'USD'}).format(p.price)}</div>
                <div className="text-sm">{p.available ? '🟢' : '🔴'}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded" onClick={()=>setEditing(p)}>Modifier</button>
                <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded" onClick={()=>onDelete(p.id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
