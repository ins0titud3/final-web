const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')

router.post('/admin/create', postController.createPost)
router.get('/posts', postController.getPosts)
router.put('/posts/:title', postController.updatePost)
router.delete('/posts/:title', postController.deletePost)

module.exports = router
