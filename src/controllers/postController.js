// Importing required modules
const fs = require('fs')
const multer = require('multer')
const Post = require('../models/post')
const storage = require('../utils/storageUtil')
const jwt = require('jsonwebtoken')

// Multer configuration for file upload
const upload = multer({ dest: './src/uploads' }).array('photos', 5)

// Controller function to get all posts
const getAllPosts = async (req, res) => {
  try {
    // Pagination parameters
    let { page = 1, pageSize = 10 } = req.query
    page = parseInt(page)
    pageSize = parseInt(pageSize)

    // Validate page and pageSize
    if (isNaN(page) || page <= 0) {
      return res.status(400).json({ message: 'Invalid page number' })
    }

    if (isNaN(pageSize) || pageSize <= 0 || pageSize > 50) {
      return res
        .status(400)
        .json({ message: 'Invalid page size. It must be between 1 and 50' })
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize

    // Fetch posts with pagination and order by creation date
    const { count, rows } = await Post.findAndCountAll({
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    })

    // If no posts found
    if (count === 0) {
      return res.status(200).json({
        message: 'No posts found',
        posts: [],
        totalCount: 0,
        totalPages: 0,
      })
    }

    // Calculate total pages
    const totalPages = Math.ceil(count / pageSize)

    // Check if requested page is out of range
    if (page > totalPages) {
      return res.status(404).json({ message: 'Page not found' })
    }

    // Send response with posts data
    res.status(200).json({ posts: rows, totalCount: count, totalPages })
  } catch (error) {
    // Handle errors
    console.error('Error fetching posts:', error)
    res
      .status(500)
      .json({ message: 'Unable to fetch posts. Please try again later.' })
  }
}

// Controller function to get a post by its ID
const getPostById = async (req, res) => {
  try {
    const postId = req.params.id
    const post = await Post.findByPk(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(200).json({ post })
  } catch (error) {
    // Handle errors
    console.error('Error fetching post by ID:', error)
    res
      .status(500)
      .json({ message: 'Something went wrong. Please try again later.' })
  }
}

// Controller function to edit a post
const editPost = async (req, res) => {
  try {
    const postId = req.params.id
    const { token, description } = req.body

    // Verify the token and extract user information
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET)

    // Find the post by ID
    const post = await Post.findByPk(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Check if the user is the creator of the post
    if (post.userId !== userId) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to edit this post' })
    }

    // Update the post data
    const updatedData = {}
    if (description) {
      updatedData.description = description
    }

    // Apply the updates
    await post.update(updatedData)

    // Send success response
    res.status(200).json({ message: 'Post updated successfully', post })
  } catch (error) {
    // Handle errors
    console.error('Error updating post:', error)
    res
      .status(500)
      .json({ message: 'Something went wrong. Please try again later.' })
  }
}

module.exports = editPost

// Controller function to create a new post
const createPost = async (req, res) => {
  try {
    // Handle file upload
    upload(req, res, async function (err) {
      if (err) {
        // Log multer errors or unknown errors
        console.error(
          err instanceof multer.MulterError
            ? 'Multer error:'
            : 'Unknown error:',
          err
        )
        return res
          .status(500)
          .json({ message: 'Something went wrong. Please try again later.' })
      }

      // Check if files are uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: 'No files were uploaded. Please select at least one file.',
        })
      }

      // Extract token from request body
      const { token } = req.body
      if (!token) {
        return res.status(401).json({ message: 'No token provided' })
      }

      // Verify token and extract user information
      const { id: userId, email: userEmail } = jwt.verify(
        token,
        process.env.JWT_SECRET
      )

      // Extract post description from request body
      const description = req.body.description
      if (!description) {
        return res.status(400).json({ message: 'Post description is required' })
      }

      // Create a subfolder within the uploads directory for the user's email
      const userUploadsDir = `./src/uploads/${userEmail}`
      if (!fs.existsSync(userUploadsDir)) {
        fs.mkdirSync(userUploadsDir)
      }

      // Initialize Google Cloud Storage bucket
      const bucketName = process.env.BUCKET_NAME
      const bucket = storage.bucket(bucketName)

      // Upload files to the user's folder in the bucket and get their URLs
      const uploadPromises = req.files.map(async (file, i) => {
        const destination = `${userEmail.split('@')[0]}-${Date.now()}-${
          i + 1
        }.${file.originalname.split('.').pop()}`
        try {
          // Upload file to Google Cloud Storage
          await bucket.upload(file.path, { destination })
          const imageUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(
            destination
          )}`

          // Delete the uploaded image file from local storage
          fs.unlinkSync(file.path)
          return imageUrl
        } catch (error) {
          // Log error and delete the uploaded image file from local storage
          console.error('Error uploading file:', error)
          fs.unlinkSync(file.path)
          throw error
        }
      })

      // Wait for all uploads to complete
      const imageUrls = await Promise.all(uploadPromises)

      // Delete the user's uploads folder after successful uploads
      fs.rmdirSync(userUploadsDir, { recursive: true })

      // Create new post with uploaded image URLs
      const newPost = await Post.create({
        description,
        photo: imageUrls,
        userId,
        userEmail,
      })

      // Send success response
      res
        .status(201)
        .json({ message: 'Post created successfully', post: newPost })
    })
  } catch (error) {
    // Log error and send error response
    console.error('Error creating post:', error)
    res
      .status(500)
      .json({ message: 'Something went wrong. Please try again later.' })
  }
}

module.exports = createPost

module.exports = { createPost, editPost, getAllPosts, getPostById }
