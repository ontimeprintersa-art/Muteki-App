const { createClient } = require('@supabase/supabase-js')
const { verifyAdmin } = require('./_adminAuth')

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env vars missing for products-create function')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

exports.handler = async function (event) {
  try {
    // Authorize admin
    const decoded = verifyAdmin(event)
    if (!decoded || decoded.role !== 'admin') return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
    const body = JSON.parse(event.body || '{}')
    const product = body.product || body

    if (!product || !product.title) return { statusCode: 400, body: JSON.stringify({ error: 'product.title required' }) }

    const { data, error } = await supabaseAdmin.from('products').insert(product).select().limit(1)
    if (error) {
      console.error('products-create error', error)
      return { statusCode: 500, body: JSON.stringify({ error: 'failed to create product' }) }
    }

    return { statusCode: 200, body: JSON.stringify(data[0]) }
  } catch (err) {
    console.error('products-create handler error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'error' }) }
  }
}
