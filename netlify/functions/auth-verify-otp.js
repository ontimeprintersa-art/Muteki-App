const Twilio = require('twilio')
const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_JWT_SECRET,
  INITIAL_ADMIN_PHONES
} = process.env

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
  console.warn('Twilio env vars missing for auth-verify-otp function')
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env vars missing for auth-verify-otp function')
}
if (!ADMIN_JWT_SECRET) {
  console.warn('ADMIN_JWT_SECRET not set; admin tokens will not be signed')
}

const twilio = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Prepare initial admin phones from env or default to the one you asked to promote
let initialAdmins = []
if (INITIAL_ADMIN_PHONES) {
  initialAdmins = INITIAL_ADMIN_PHONES.split(',').map(p => p.trim())
} else {
  // default fallback — promote the phone you provided (+27 69 80 25 139 normalized)
  initialAdmins = ['+27698025139']
}

function normalizePhone(p) {
  if (!p) return p
  return p.replace(/\s+/g, '').replace(/[^+0-9]/g, '')
}

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
    const { phone, code } = JSON.parse(event.body || '{}')
    if (!phone || !code) return { statusCode: 400, body: JSON.stringify({ error: 'phone and code required' }) }

    const to = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`

    const check = await twilio.verify.services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to, code })

    if (check.status !== 'approved' && check.status !== 'valid') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid code', status: check.status }) }
    }

    // Normalize phone for storage (no whatsapp: prefix)
    const phoneNormalized = normalizePhone(phone.replace(/^whatsapp:/i, ''))

    // If this phone is in initialAdmins promote to admin (one-time)
    const isInitialAdmin = initialAdmins.map(normalizePhone).includes(phoneNormalized)

    const upsertBody = isInitialAdmin ? { phone: phoneNormalized, role: 'admin' } : { phone: phoneNormalized }

    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(upsertBody, { onConflict: 'phone', returning: 'representation' })

    if (error) {
      console.error('Supabase upsert user error', error)
      return { statusCode: 500, body: JSON.stringify({ error: 'failed to upsert user' }) }
    }

    const user = Array.isArray(data) ? data[0] : data

    // If user is admin, sign an admin token
    let adminToken = null
    if (user && user.role === 'admin' && ADMIN_JWT_SECRET) {
      try {
        adminToken = jwt.sign({ sub: user.id, phone: user.phone, role: user.role }, ADMIN_JWT_SECRET, { expiresIn: '24h' })
      } catch (err) {
        console.error('failed to sign admin token', err)
      }
    }

    return { statusCode: 200, body: JSON.stringify({ user, adminToken }) }

  } catch (err) {
    console.error('auth-verify-otp error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'verify error' }) }
  }
}
