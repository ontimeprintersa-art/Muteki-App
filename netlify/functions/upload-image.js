const { createClient } = require('@supabase/supabase-js')
const { verifyAdmin } = require('./_adminAuth')

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env vars missing for upload-image function')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

exports.handler = async function (event) {
  try {
    const decoded = verifyAdmin(event)
    if (!decoded || decoded.role !== 'admin') return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
    // Expect JSON body: { filename, fileBase64, contentType, folder }
    const body = JSON.parse(event.body || '{}')
    const { filename, fileBase64, contentType = 'application/octet-stream', folder = 'products' } = body
    if (!filename || !fileBase64) return { statusCode: 400, body: JSON.stringify({ error: 'filename and fileBase64 required' }) }

    const buffer = Buffer.from(fileBase64, 'base64')
    const key = `${folder}/${Date.now()}-${filename}`

    const { error: uploadErr } = await supabaseAdmin.storage.from('product-images').upload(key, buffer, { contentType, upsert: false })
    if (uploadErr) {
      console.error('upload-image error', uploadErr)
      return { statusCode: 500, body: JSON.stringify({ error: 'failed to upload' }) }
    }

    const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(key)
    // data.publicUrl
    return { statusCode: 200, body: JSON.stringify({ url: data.publicUrl, key }) }
  } catch (err) {
    console.error('upload-image handler error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'error' }) }
  }
}
