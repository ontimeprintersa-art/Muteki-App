### Newly added serverless functions

I added the following Netlify Functions to support product management and image uploads. All function endpoints are available under `/api/<name>` (Netlify redirect maps to `/.netlify/functions/<name>`).

- POST /api/products-create — create a product (body: product JSON)
- PUT  /api/products-update — update a product (body: { id, ...fields })
- DELETE /api/products-delete — delete a product (body: { id })
- POST /api/upload-image — upload an image (body: { filename, fileBase64, contentType, folder }) — stores to Supabase Storage bucket `product-images` and returns public URL
- POST /api/seed-products — seed products from server/data/products.json into Supabase (for staging)

Security notes
- These endpoints use the SUPABASE_SERVICE_ROLE_KEY and therefore must be kept server-side. Configure the environment variable in Netlify (Settings > Build & deploy > Environment).
- For production, add authentication and authorization checks to these functions. Right now they are open to anyone who can call them (use a signed token or check the logged-in user).

Client examples
- Create product:
  fetch('/api/products-create', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ product: { title:'Test', price:10 } }) })

- Update product:
  fetch('/api/products-update', { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id:'uuid', price:12 }) })

- Delete product:
  fetch('/api/products-delete', { method: 'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id:'uuid' }) })

- Upload image (JS):
  const rawFile = ... // File from <input>
  const reader = new FileReader()
  reader.onload = async () => {
    const b64 = reader.result.split(',')[1]
    const res = await fetch('/api/upload-image', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ filename: rawFile.name, fileBase64: b64, contentType: rawFile.type }) })
    const json = await res.json()
    console.log(json.url)
  }
  reader.readAsDataURL(rawFile)

- Seed products (dev):
  fetch('/api/seed-products', { method:'POST' })
