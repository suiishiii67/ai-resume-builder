// Entry point: sets up Express, connects to MongoDB and starts the server
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

// Only our React app (CLIENT_URL) may call this API from the browser
app.use(cors({ origin: process.env.CLIENT_URL }))

// Read JSON bodies (2mb is plenty for a resume)
app.use(express.json({ limit: '2mb' }))

// Quick way to see that the server and database are working
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1
  res.json({ ok: true, db: isConnected ? 'connected' : 'disconnected' })
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

const PORT = process.env.PORT || 5001

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB. Is it running?', error.message)
    process.exit(1)
  })
