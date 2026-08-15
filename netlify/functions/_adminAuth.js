const jwt = require('jsonwebtoken')

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET
if (!ADMIN_JWT_SECRET) console.warn('ADMIN_JWT_SECRET is not set for admin token verification')

function extractTokenFromEvent(event){
  const headers = event.headers || {}
  const auth = headers.authorization || headers.Authorization
  if (!auth) return null
  const parts = auth.split(' ')
  if (parts.length !== 2) return null
  return parts[1]
}

function verifyAdmin(event){
  const token = extractTokenFromEvent(event)
  if (!token) return null
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET)
    return decoded
  } catch (err) {
    console.warn('admin token verify failed', err.message)
    return null
  }
}

module.exports = { verifyAdmin }
