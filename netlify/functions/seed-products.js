const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env vars missing for seed-products function')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }

    const dataPath = path.join(__dirname, '..', 'server', 'data', 'products.json')
    let products = []
    try {
      products = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    } catch (e) {
      console.warn('Could not read products.json', e)
      return { statusCode: 500, body: JSON.stringify({ error: 'products seed file not found' }) }
    }

    // Upsert products by title+vendeur (naive)
    for (const p of products) {
      const { title, vendeur } = p
      await supabaseAdmin.from('products').upsert(p, { onConflict: 'title' })
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, count: products.length }) }
  } catch (err) {
    console.error('seed-products handler error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'error' }) }
  }
}
