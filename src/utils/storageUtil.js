const { Storage } = require('@google-cloud/storage')
require('dotenv').config()

// Load environment variables
const projectId = process.env.PROJECT_ID
const keyFilename = process.env.KEYFILENAME

// Initialize Google Cloud Storage
const storage = new Storage({ projectId, keyFilename })

module.exports = storage
