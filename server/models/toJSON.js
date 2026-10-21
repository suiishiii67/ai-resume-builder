// Shared JSON settings for every model: send "id" instead of "_id",
// and never send "__v" or the password to the frontend.
const toJSON = {
  transform(doc, ret) {
    if (ret._id) ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    delete ret.password
    return ret
  },
}

module.exports = toJSON
