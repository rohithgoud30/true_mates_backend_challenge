const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./user') // Import User model

// Define the Friend model
const Friend = sequelize.define('Friend', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Unique identifier for each friend relationship',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of the user who initiated the friend request',
  },
  friendId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of the user who received the friend request',
  },
})

// Define associations
Friend.belongsTo(User, { foreignKey: 'userId', as: 'user' }) // Specify alias for clarity
Friend.belongsTo(User, { foreignKey: 'friendId', as: 'friend' }) // Specify alias for clarity

module.exports = Friend
