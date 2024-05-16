const express = require('express')
const router = express.Router()
const {
  createPost,
  getAllPosts,
  editPost,
  getPostById,
} = require('../controllers/postController')

// GET /posts - Route to retrieve all posts
router.get('/', getAllPosts)

// POST /posts - Route to create a new post
router.post('/', createPost)

// PUT /posts/:id - Route to edit an existing post
router.put('/:id', editPost)

// GET /posts/:id - Route to retrieve a post by its ID
router.get('/:id', getPostById)

module.exports = router
