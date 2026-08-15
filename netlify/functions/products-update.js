const { createClient } = require('@supabase/supabase-js')
const { verifyAdmin } = require('./_adminAuth')

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env vars missing for products-update function')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

exports.handler = async function (event) {
  try {
    const decoded = verifyAdmin(event)
    if (!decoded || decoded.role !== 'admin') return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

    if (event.httpMethod !== 'PUT') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
    const body = JSON.parse(event.body || '{}')
    const { id, ...patch } = body
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id required' }) }

    const { data, error } = await supabaseAdmin.from('products').update(patch).eq('id', id).select()
    if (error) {
      console.error('products-update error', error)
      return { statusCode: 500, body: JSON.stringify({ error: 'failed to update product' }) }
    }

    return { statusCode: 200, body: JSON.stringify(data[0] || {}) }
  } catch (err) {
    console.error('products-update handler error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'error' }) }
  }
}
