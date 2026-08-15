const Twilio = require('twilio')
const { createClient } = require('@supabase/supabase-js')

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
} = process.env

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
  console.warn('Twilio env vars missing for auth-verify-otp function')
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env vars missing for auth-verify-otp function')
}

const twilio = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

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

    const phoneNormalized = phone.replace(/^whatsapp:/i, '')
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({ phone: phoneNormalized }, { onConflict: 'phone', returning: 'representation' })

    if (error) {
      console.error('Supabase upsert user error', error)
      return { statusCode: 500, body: JSON.stringify({ error: 'failed to upsert user' }) }
    }

    const user = Array.isArray(data) ? data[0] : data
    return { statusCode: 200, body: JSON.stringify({ user }) }

  } catch (err) {
    console.error('auth-verify-otp error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'verify error' }) }
  }
}
