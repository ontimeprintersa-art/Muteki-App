import React from 'react'

function buildWaLink(phone, title){
  const clean = phone.replace(/\D/g,'')
  const message = `Bonjour, je viens de Muteki. Je suis intéressé par ${title}`
  return `https://wa.me/${encodeURIComponent(clean)}?text=${encodeURIComponent(message)}`
}

export default function ProductCard({ p }){
  return (
    <article className="bg-white border rounded-lg p-3 flex flex-col">
      <img src={p.image} alt={p.title} className="w-full h-44 object-cover rounded" loading="lazy" />
      <h3 className="mt-2 font-semibold">{p.title}</h3>
      <p className="text-sm text-gray-600">Vendeur: {p.vendeur} • {p.location}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="font-bold">{Intl.NumberFormat('fr-FR', {style:'currency', currency:p.currency||'USD'}).format(p.price)}</div>
        <div className="text-sm">{p.available ? '🟢 En ligne' : '🔴 Hors ligne'}</div>
      </div>
      <a className="mt-3 bg-green-600 text-white px-3 py-2 rounded text-center" href={buildWaLink(p.phone, p.title)} target="_blank" rel="noopener noreferrer">Contacter sur WhatsApp</a>
    </article>
  )
}
