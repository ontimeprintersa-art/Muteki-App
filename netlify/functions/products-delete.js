const { createClient } = require('@supabase/supabase-js')

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env vars missing for products-delete function')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'DELETE') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
    const body = JSON.parse(event.body || '{}')
    const { id } = body
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id required' }) }

    const { data, error } = await supabaseAdmin.from('products').delete().eq('id', id).select()
    if (error) {
      console.error('products-delete error', error)
      return { statusCode: 500, body: JSON.stringify({ error: 'failed to delete product' }) }
    }

    return { statusCode: 200, body: JSON.stringify({ deleted: data.length }) }
  } catch (err) {
    console.error('products-delete handler error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'error' }) }
  }
}
