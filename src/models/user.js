const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: sequelize.literal('gen_random_uuid()'),
    primaryKey: true,
    comment: 'Unique identifier for each user', // Add comment for clarity
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the user', // Add comment for clarity
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Email address of the user', // Add comment for clarity
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Password hash of the user', // Add comment for clarity
  },
})

module.exports = User
