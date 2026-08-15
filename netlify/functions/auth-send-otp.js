const Twilio = require('twilio')

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID
} = process.env

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
  console.warn('Twilio env vars missing for auth-send-otp function')
}

const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

// Simple in-memory rate limiter per phone. NOTE: serverless containers can be recycled,
// so this limiter is best-effort. For production use a persistent store (Redis/Supabase table).
const rateMap = new Map()
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_PER_WINDOW = 3

function allowSend(phone) {
  const now = Date.now()
  const entry = rateMap.get(phone) || []
  // keep timestamps within window
  const recent = entry.filter(ts => now - ts < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) return false
  recent.push(now)
  rateMap.set(phone, recent)
  return true
}

exports.handler = async function (event) {
  try {
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {}
    const { phone } = body
    if (!phone) {
      return { statusCode: 400, body: JSON.stringify({ error: 'phone required' }) }
    }

    // Require +243 prefix for DRC numbers to avoid accidental international sends
    if (!phone.startsWith('+243')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Phone must be a +243 DRC number' }) }
    }

    if (!allowSend(phone)) {
      return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests for this phone. Try again later.' }) }
    }

    const to = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`

    const verification = await client.verify.services(TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to, channel: 'whatsapp' })

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, sid: verification.sid, status: verification.status })
    }
  } catch (err) {
    console.error('auth-send-otp error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'error sending otp' }) }
  }
}
