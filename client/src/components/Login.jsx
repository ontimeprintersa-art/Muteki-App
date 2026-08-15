import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function Login() {
  const [show, setShow] = useState(false)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1) // 1=phone, 2=otp
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const modalRef = useRef(null)

  // Init token & event listener
  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('muteki_admin_token') || localStorage.getItem('adminToken')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    const openHandler = () => {
      setError('')
      setShow(true)
    }
    window.addEventListener('muteki:open-login', openHandler)

    return () => {
      window.removeEventListener('muteki:open-login', openHandler)
    }
  }, [])

  // Prevent background scroll while modal is open
  useEffect(() => {
    if (show) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [show])

  // Close on ESC
  const onKeyDown = (e) => {
    if (e.key === 'Escape') setShow(false)
  }

  const validatePhone = (p) => {
    // Basic check: allow + and digits, length 6-15
    return /^\+?\d{6,15}$/.test(p)
  }

  const sendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setError('')
    if (!validatePhone(phone)) {
      setError('Numéro invalide — utilisez le format +2376...')
      return
    }
    try {
      setLoading(true)
      await axios.post('/api/auth-request-otp', { phone })
      setStep(2)
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Impossible d\'envoyer le code. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setError('')
    if (!code) {
      setError('Entrez le code reçu')
      return
    }
    try {
      setLoading(true)
      const res = await axios.post('/api/auth-verify-otp', { phone, code })
      const token = res?.data?.adminToken
      if (!token) throw new Error('Pas de token retourné')

      // Persist token under the repo standard key and set axios header
      localStorage.setItem('muteki_admin_token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // notify app and close modal
      window.dispatchEvent(new Event('muteki:login'))
      setShow(false)
      setStep(1)
      setPhone('')
      setCode('')

      // If your app can't react to the event, you can uncomment to force reload:
      // window.location.reload()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Code invalide ou erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return <button onClick={() => setShow(true)}>Se Connecter</button>

  return (
    <div
      onKeyDown={onKeyDown}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: '#0008',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      aria-hidden={!show}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Login"
        style={{ background: 'white', padding: 20, minWidth: 320, borderRadius: 6 }}
      >
        {step === 1 ? (
          <form onSubmit={sendOtp}>
            <h3>Entre ton téléphone</h3>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+2376..."
              autoFocus
              aria-label="Téléphone"
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer Code'}</button>
              <button type="button" onClick={() => { setShow(false); setStep(1); setError('') }} disabled={loading}>Fermer</button>
            </div>
            {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <h3>Entre le code</h3>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="123456"
              autoFocus
              aria-label="Code"
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={loading}>{loading ? 'Validation...' : 'Valider'}</button>
              <button type="button" onClick={() => { setShow(false); setStep(1); setError('') }} disabled={loading}>Fermer</button>
            </div>
            {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
          </form>
        )}
      </div>
    </div>
  )
}
