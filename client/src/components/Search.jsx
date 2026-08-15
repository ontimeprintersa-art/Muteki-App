import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import axios from 'axios'

export default function Search({ apiBase }){
  const [q, setQ] = useState('')
  const [ville, setVille] = useState('Kinshasa')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try{
      const res = await axios.get('/api/products', { params: { q, ville } })
      setProducts(res.data)
    }catch(e){
      console.warn(e)
    }
    setLoading(false)
  }

  useEffect(()=>{ fetchProducts() }, [])

  return (
    <div>
      <form onSubmit={e=>{ e.preventDefault(); fetchProducts() }} className="flex gap-3 flex-wrap mb-4">
        <input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Que cherches-tu?" className="border rounded px-3 py-2 flex-1 min-w-[160px]" />
        <select value={ville} onChange={e=>setVille(e.target.value)} className="border rounded px-3 py-2">
          <option>Kinshasa</option>
          <option>Lubumbashi</option>
          <option>Goma</option>
          <option>Pretoria</option>
        </select>
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">Rechercher</button>
      </form>

      {loading && <div className="text-sm text-gray-600">Chargement...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 && !loading ? <div className="text-gray-600">Aucun produit trouvé</div> : products.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  )
}
