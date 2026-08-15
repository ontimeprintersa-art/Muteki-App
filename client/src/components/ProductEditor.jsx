import React, { useState } from 'react'
import axios from 'axios'

export default function ProductEditor({ product = {}, onSaved = ()=>{}, onCancel = ()=>{} }){
  const [form, setForm] = useState({
    title: product.title || '',
    vendeur: product.vendeur || '',
    location: product.location || '',
    price: product.price || 0,
    currency: product.currency || 'USD',
    phone: product.phone || '',
    available: product.available !== undefined ? product.available : true,
    image: product.image || '',
  })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setForm(fm => ({ ...fm, image: reader.result }))
    reader.readAsDataURL(f)
  }

  const uploadImage = async () => {
    if (!file) return
    setUploading(true)
    try{
      const reader = new FileReader()
      reader.onload = async () => {
        const b64 = reader.result.split(',')[1]
        const res = await axios.post('/api/upload-image', { filename: file.name, fileBase64: b64, contentType: file.type })
        setForm(fm => ({ ...fm, image: res.data.url }))
      }
      reader.readAsDataURL(file)
    }catch(e){ alert('Upload failed') }
    setUploading(false)
  }

  const save = async () => {
    setSaving(true)
    try{
      const payload = { ...form }
      if (product.id) {
        await axios.put('/api/products-update', { id: product.id, ...payload })
      } else {
        await axios.post('/api/products-create', { product: payload })
      }
      onSaved()
    }catch(e){
      alert('Erreur sauvegarde')
    }
    setSaving(false)
  }

  return (
    <div className="bg-white border rounded p-4">
      <div className="grid grid-cols-1 gap-2">
        <input className="border px-2 py-1" placeholder="Titre" value={form.title} onChange={e=>handleChange('title', e.target.value)} />
        <input className="border px-2 py-1" placeholder="Vendeur" value={form.vendeur} onChange={e=>handleChange('vendeur', e.target.value)} />
        <input className="border px-2 py-1" placeholder="Location" value={form.location} onChange={e=>handleChange('location', e.target.value)} />
        <div className="flex gap-2">
          <input type="number" className="border px-2 py-1 flex-1" placeholder="Prix" value={form.price} onChange={e=>handleChange('price', Number(e.target.value))} />
          <input className="border px-2 py-1 w-24" placeholder="Devise" value={form.currency} onChange={e=>handleChange('currency', e.target.value)} />
        </div>
        <input className="border px-2 py-1" placeholder="Téléphone" value={form.phone} onChange={e=>handleChange('phone', e.target.value)} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.available} onChange={e=>handleChange('available', e.target.checked)} /> Disponible</label>

        <div>
          <input type="file" accept="image/*" onChange={handleFile} />
          <div className="mt-2">
            {form.image && <img src={form.image} alt="preview" className="w-48 h-48 object-cover rounded" />}
          </div>
          {file && <div className="mt-2"><button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={uploadImage} disabled={uploading}>{uploading? 'Upload...' : 'Charger sur le serveur'}</button></div>}
        </div>

        <div className="flex gap-2 mt-3">
          <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={save} disabled={saving}>{saving? 'Sauvegarde...' : 'Sauvegarder'}</button>
          <button className="bg-gray-300 px-3 py-1 rounded" onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  )
}
