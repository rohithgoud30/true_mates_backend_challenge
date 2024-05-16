const express = require('express')
const router = express.Router()
const { searchUsers, addFriend } = require('../controllers/friendsController')

// POST /friends/search - Route for searching users
router.post('/search', searchUsers)

// POST /friends/add - Route for adding friends
router.post('/add', addFriend)

module.exports = router
