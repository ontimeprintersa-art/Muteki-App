import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function AddProductForm({ open, onClose }) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open) {
      setMessage('')
    }
  }, [open])

  useEffect(() => {
    if (!images || images.length === 0) {
      setPreviews([])
      return
    }
    const urls = images.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach(u => URL.revokeObjectURL(u))
  }, [images])

  const handleFiles = (e) => {
    setImages(Array.from(e.target.files || []))
  }

  const resetForm = () => {
    setTitle('')
    setPrice('')
    setDescription('')
    setCategory('')
    setLocation('')
    setImages([])
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    const token = localStorage.getItem('muteki_admin_token')
    if (!token) {
      setMessage('Non autorisé')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('price', price)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('location', location)
      images.forEach((img) => formData.append('images', img))

      await axios.post('/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      setMessage('Produit ajouté')
      resetForm()
    } catch (err) {
      console.error(err)
      setMessage(err?.response?.data?.message || 'Erreur lors de l\'ajout du produit')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Ajouter un Produit</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {message && (
          <div className="mb-4 text-sm text-green-700 bg-green-100 p-2 rounded">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              className="mt-1 block w-full border rounded px-3 py-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prix</label>
            <input
              type="number"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full border rounded px-3 py-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Catégorie</label>
              <input
                className="mt-1 block w-full border rounded px-3 py-2"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Localisation</label>
              <input
                className="mt-1 block w-full border rounded px-3 py-2"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="mt-1"
            />

            {previews.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt={`preview-${i}`} className="w-20 h-20 object-cover rounded border" />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Envoi...' : '+ Ajouter le Produit'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
