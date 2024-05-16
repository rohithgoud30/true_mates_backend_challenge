const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./user')
const moment = require('moment')

// Define the Post model
const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Unique identifier for each post', // Add comment for clarity
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Description of the post', // Add comment for clarity
  },
  photo: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    comment: 'Array of photo URLs associated with the post', // Add comment for clarity
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    references: User.email,
    comment: 'Email of the user who created the post', // Add comment for clarity
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Timestamp indicating when the post was created', // Add comment for clarity
  },
  created: {
    type: DataTypes.VIRTUAL,
    get() {
      // Calculate time difference and format it
      const diff = moment().diff(moment(this.createdAt), 'seconds')
      if (diff < 60) {
        return `${diff}s ago`
      } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}m ago`
      } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)}h ago`
      } else if (diff < 604800) {
        return `${Math.floor(diff / 86400)}d ago`
      } else if (diff < 2419200) {
        return `${Math.floor(diff / 604800)}w ago`
      } else if (diff < 29030400) {
        return `${Math.floor(diff / 2419200)}mo ago`
      } else {
        return `${Math.floor(diff / 29030400)}yr ago`
      }
    },
    comment: 'Virtual field to display time elapsed since the post was created', // Add comment for clarity
  },
})

module.exports = Post
