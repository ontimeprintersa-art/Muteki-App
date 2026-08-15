const { createClient } = require('@supabase/supabase-js')

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env vars missing for products function')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

exports.handler = async function (event) {
  try {
    const q = (event.queryStringParameters?.q || '').toLowerCase()
    const ville = (event.queryStringParameters?.ville || '').toLowerCase()

    let query = supabaseAdmin.from('products').select('*')

    if (q) {
      // search in title, vendeur, location
      query = query.or(`title.ilike.%${q}%,vendeur.ilike.%${q}%,location.ilike.%${q}%`)
    }
    if (ville) {
      query = query.ilike('location', `%${ville}%`)
    }

    query = query.limit(100)

    const { data, error } = await query
    if (error) {
      console.error('supabase products error', error)
      return { statusCode: 500, body: JSON.stringify({ error: 'failed to fetch products' }) }
    }

    return { statusCode: 200, body: JSON.stringify(data) }

  } catch (err) {
    console.error('products function error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'error' }) }
  }
}
