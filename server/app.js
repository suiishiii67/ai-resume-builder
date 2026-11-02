// Sets up Express: middleware and routes. server.js runs it on your laptop, api/index.js runs it on Vercel.
require('dotenv').config({ quiet: true })
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const resumeRoutes = require('./routes/resumeRoutes')
const atsRoutes = require('./routes/atsRoutes')
const adminRoutes = require('./routes/adminRoutes')
const aiRoutes = require('./routes/aiRoutes')
const catalogRoutes = require('./routes/catalogRoutes')

const app = express()

// Only our React app (CLIENT_URL) may call this API from the browser.
// In development the Vite dev server on localhost is allowed too.
const allowedOrigins = [process.env.CLIENT_URL]
if (process.env.NODE_ENV !== 'production') allowedOrigins.push('http://localhost:5173')
app.use(cors({ origin: allowedOrigins }))

// Read JSON bodies (2mb is plenty for a resume)
app.use(express.json({ limit: '2mb' }))

// Quick way to see that the server and database are working.
// It tries to connect first, so a fresh Vercel instance reports the real database status.
app.get('/api/health', async (req, res) => {
  try {
    await connectDB()
  } catch {
    // Not connected: the answer below says "disconnected"
  }
  const isConnected = mongoose.connection.readyState === 1
  res.json({ ok: true, db: isConnected ? 'connected' : 'disconnected' })
})

// Make sure MongoDB is connected before any route runs (on Vercel the first request opens the connection)
app.use(async (req, res, next) => {
  await connectDB()
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/ats', atsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/catalog', catalogRoutes)

// These two must stay last
app.use(notFound)
app.use(errorHandler)

module.exports = app
