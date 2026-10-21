// Any URL that no route matched
function notFound(req, res, next) {
  const error = new Error(`Not found: ${req.method} ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

// One place that turns every error into { message } with the right status code.
// Express 5 also sends errors thrown in async controllers here, so controllers need no try/catch.
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Something went wrong on the server.'

  // Mongoose: a field failed its schema rules
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(error.errors).map((fieldError) => fieldError.message).join(' ')
  }

  // Mongoose: an id in the URL is not a valid MongoDB id
  if (error.name === 'CastError') {
    statusCode = 404
    message = 'Not found.'
  }

  // MongoDB: a unique field (like email) already exists
  if (error.code === 11000) {
    statusCode = 409
    message = 'An account with this email already exists.'
  }

  // Bad JSON in the request body, or a body over 2mb
  if (error.type === 'entity.parse.failed') {
    statusCode = 400
    message = 'The request body is not valid JSON.'
  }
  if (error.type === 'entity.too.large') {
    statusCode = 413
    message = 'The request is too large.'
  }

  if (statusCode === 500) console.error(error)
  res.status(statusCode).json({ message })
}

module.exports = { notFound, errorHandler }
