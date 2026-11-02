// Connects to MongoDB using MONGO_URI from .env
const mongoose = require('mongoose')

// On Vercel one running copy of the server answers many requests, so we connect once and reuse it
let connection = null

function connectDB() {
  if (!connection) {
    connection = mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log(`MongoDB connected: ${mongoose.connection.name}`))
      .catch((error) => {
        // Forget the failed attempt so the next request tries again
        connection = null
        throw error
      })
  }
  return connection
}

module.exports = connectDB
