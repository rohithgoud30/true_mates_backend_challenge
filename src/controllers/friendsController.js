// Import the Sequelize operator module for advanced querying
const { Op } = require('sequelize')
const Friend = require('../models/friend')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

/// Function to search for users based on name or email
const searchUsers = async (req, res) => {
  const { searchQuery } = req.query
  const { token } = req.body

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query not provided' })
  }

  try {
    // Verify and decode the token
    const currentUser = jwt.verify(token, process.env.JWT_SECRET)

    // Search for users matching the search query, excluding the current user
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { name: { [Op.iLike]: `%${searchQuery}%` } }, // Case-insensitive name search
              { email: { [Op.iLike]: `%${searchQuery}%` } }, // Case-insensitive email search
            ],
          },
          { id: { [Op.ne]: currentUser.id } }, // Exclude current user
        ],
      },
    })

    // Calculate mutual friends count for each user
    const usersWithMutualFriendsCount = await Promise.all(
      users.map(async (user) => {
        const mutualFriendsCount = await calculateMutualFriendsCount(
          user.id,
          currentUser.id
        )
        return { ...user.toJSON(), mutualFriendsCount }
      })
    )

    res.status(200).json({ users: usersWithMutualFriendsCount })
  } catch (error) {
    console.error('Error searching users:', error)
    res
      .status(500)
      .json({ message: 'Unable to search users. Please try again later.' })
  }
}

// Function to calculate the count of mutual friends between two users
const calculateMutualFriendsCount = async (userId, currentUserId) => {
  try {
    // Retrieve friend lists for both users
    const friendsOfUser = await Friend.findAll({ where: { userId } })
    const friendsOfCurrentUser = await Friend.findAll({
      where: { userId: currentUserId },
    })

    // Filter mutual friends
    const mutualFriends = friendsOfUser.filter((friend) =>
      friendsOfCurrentUser.some(
        (currentFriend) => currentFriend.friendId === friend.friendId
      )
    )

    return mutualFriends.length
  } catch (error) {
    console.error('Error calculating mutual friends count:', error)
    return 0 // Return 0 in case of error
  }
}

// Function to add a friend for the current user
const addFriend = async (req, res) => {
  const { token, friendId } = req.body

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    // Verify and decode the token
    const { id: currentUserId } = jwt.verify(token, process.env.JWT_SECRET)

    // Find the friend user
    const friendUser = await User.findOne({ where: { id: friendId } })
    if (!friendUser) {
      return res.status(404).json({ message: 'Friend not found' })
    }

    // Check if the friend is already added
    const existingFriend = await Friend.findOne({
      where: { userId: currentUserId, friendId: friendId },
    })

    if (existingFriend) {
      return res.status(400).json({ message: 'Friend already added' })
    }

    // Add the friend
    await Friend.create({
      userId: currentUserId,
      friendId: friendId,
    })

    res.status(200).json({ message: 'Friend added successfully' })
  } catch (error) {
    console.error('Error adding friend:', error)
    res
      .status(500)
      .json({ message: 'Unable to add friend. Please try again later.' })
  }
}

module.exports = { searchUsers, addFriend }
