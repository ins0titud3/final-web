const Post = require('../models/post')

exports.createPost = async (req, res) => {
  try {
    const { title, description, images } = req.body
    const post = new Post({ title, description, images })
    await post.save()

    res.redirect('/home')
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
    console.log(posts)
    return posts
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updatePost = async (req, res) => {
  try {
    const { title } = req.params
    const { description, images } = req.body
    const new_title = req.body.newTitle
    console.log('Params:', req.params)
    console.log('Body:', req.body)
    if (!new_title || !description || !images) {
      throw new Error('Invalid request body')
    }
    const updatedPost = await Post.findOneAndUpdate(
      { title: title },
      { title: new_title, description: description, images: images, updatedAt: Date.now() },
      { new: true }
    )

    if (!updatedPost) {
      throw new Error('Post not found')
    }

    res.status(200).json({ post: updatedPost })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deletePost = async (req, res) => {
  try {
    const { title } = req.params
    await Post.findOneAndDelete({ title })

    res.redirect('/home')
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
