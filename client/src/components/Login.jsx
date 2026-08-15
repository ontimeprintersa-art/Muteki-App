import React, { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin }) {
  const [step, setStep] = useState(0)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const sendOtp = async () => {
    setLoading(true); setMsg('')
    try {
      await axios.post('/api/auth-send-otp', { phone })
      setStep(1)
      setMsg('Code envoyé via WhatsApp. Vérifiez votre WhatsApp.')
    } catch (e) {
      setMsg(e?.response?.data?.error || 'Erreur envoi OTP')
    }
    setLoading(false)
  }

  const verify = async () => {
    setLoading(true); setMsg('')
    try {
      const res = await axios.post('/api/auth-verify-otp', { phone, code })
      const user = res.data.user
      onLogin(user)
      setStep(0); setPhone(''); setCode('')
    } catch (e) {
      setMsg(e?.response?.data?.error || 'Code invalide')
    }
    setLoading(false)
  }

  if (step === 0) {
    return (
      <div className="flex items-center gap-2">
        <input className="border px-2 py-1 rounded" placeholder="+2438..." value={phone} onChange={e => setPhone(e.target.value)} />
        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={sendOtp} disabled={loading || !phone}>Connexion</button>
        {msg && <div className="text-xs text-gray-600 ml-2">{msg}</div>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input className="border px-2 py-1 rounded" placeholder="Code WhatsApp" value={code} onChange={e => setCode(e.target.value)} />
      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={verify} disabled={loading || !code}>Valider</button>
      <button className="text-sm text-gray-600" onClick={() => setStep(0)}>Annuler</button>
      {msg && <div className="text-xs text-gray-600 ml-2">{msg}</div>}
    </div>
  )
}
