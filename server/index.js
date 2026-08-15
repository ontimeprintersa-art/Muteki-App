const express = require('express')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.ADMIN_TOKEN

// Allow requests from the frontend
app.use(cors({ origin: 'https://muteki-app.netlify.app' }))

// Serve uploaded images
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
app.use('/uploads', express.static(uploadsDir))

// simple JSON "database"
const dataFile = path.join(__dirname, 'data', 'products.json')
const ensureDataFile = () => {
  const dir = path.dirname(dataFile)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify({ products: [] }, null, 2))
}
ensureDataFile()

const readData = () => JSON.parse(fs.readFileSync(dataFile, 'utf8'))
const writeData = (obj) => fs.writeFileSync(dataFile, JSON.stringify(obj, null, 2))

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = Date.now() + '-' + crypto.randomBytes(6).toString('hex') + ext
    cb(null, name)
  }
})
const upload = multer({ storage })

// Auth middleware
function requireAdmin(req, res, next) {
  const auth = req.headers['authorization'] || ''
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' })
  const token = auth.slice('Bearer '.length)
  // Accept token from ADMIN_TOKEN env var
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) return res.status(401).json({ message: 'Unauthorized' })
  next()
}

// Route: create product
app.post('/api/products', requireAdmin, upload.array('images', 12), (req, res) => {
  try {
    const { title, price, description, category, location } = req.body
    if (!title || !price || !description) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const files = req.files || []
    const imageUrls = files.map(f => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`)

    const db = readData()
    const product = {
      id: Date.now().toString(),
      title,
      price: Number(price),
      description,
      category: category || null,
      location: location || null,
      images: imageUrls,
      createdAt: new Date().toISOString()
    }

    db.products.push(product)
    writeData(db)

    return res.json({ message: 'Produit ajouté', product })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// simple health
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
