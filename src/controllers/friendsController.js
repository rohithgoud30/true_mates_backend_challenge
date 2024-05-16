// Import the Sequelize operator module for advanced querying
const { Op } = require('sequelize')
const Friend = require('../models/friend')
const User = require('../models/user')

// Function to search for users based on name or email
const searchUsers = async (req, res) => {
  const { searchQuery } = req.query
  const { email } = req.body

  try {
    // Find the current user
    const currentUser = await User.findOne({ where: { email } })
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Search for users matching the search query
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchQuery}%` } }, // Case-insensitive name search
          { email: { [Op.iLike]: `%${searchQuery}%` } }, // Case-insensitive email search
        ],
      },
    })

    // Calculate mutual friends count for each user
    const usersWithMutualFriendsCount = await Promise.all(
      users.map(async (user) => {
        if (!user) {
          return null // or some default value
        }

        const mutualFriendsCount = await calculateMutualFriendsCount(
          user.email,
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
const calculateMutualFriendsCount = async (userEmail, currentUserId) => {
  try {
    // Retrieve user ID from email
    const user = await User.findOne({ where: { email: userEmail } })
    if (!user) {
      return 0 // If the user is not found, return 0 mutual friends
    }
    const userId = user.id

    // Retrieve friend lists for both users
    const friendsOfUser = await Friend.findAll({ where: { userId } })
    const friendsOfCurrentUser = await Friend.findAll({
      where: { userId: currentUserId },
    })

    // Filter mutual friends
    const mutualFriends = friendsOfUser.filter((friend) =>
      friendsOfCurrentUser.find(
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
  const { email, friendId } = req.body

  try {
    // Find the current user
    const currentUser = await User.findOne({ where: { email } })
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Find the friend user
    const friendUser = await User.findOne({ where: { id: friendId } })
    if (!friendUser) {
      return res.status(404).json({ message: 'Friend not found' })
    }

    // Check if the friend is already added
    const existingFriend = await Friend.findOne({
      where: { userId: currentUser.id, friendId: friendId },
    })

    if (existingFriend) {
      return res.status(400).json({ message: 'Friend already added' })
    }

    // Add the friend
    await Friend.create({
      userId: currentUser.id,
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
