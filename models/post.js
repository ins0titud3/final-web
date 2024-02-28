const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
