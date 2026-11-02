// Entry point on your laptop: connects to MongoDB and starts the server (the app itself is in app.js)
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5001

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB. Is it running?', error.message)
    process.exit(1)
  })
