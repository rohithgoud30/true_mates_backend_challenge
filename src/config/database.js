const { Sequelize } = require('sequelize')

// Initialize Sequelize with database configurations
const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USERNAME, // Database username
  process.env.DB_PASSWORD, // Database password
  {
    host: process.env.DB_HOST, // Database host
    dialect: process.env.DB_DIALECT, // Database dialect (e.g., postgres, mysql, etc.)
  }
)

// Export the configured sequelize instance
module.exports = sequelize
