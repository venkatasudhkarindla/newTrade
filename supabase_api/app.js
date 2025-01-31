// app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const deviceRoutes = require('./routes/deviceRoutes');  // Import the device routes

const app = express();


const allowedOrigins = ['http://localhost:5000']; // replace with your React app's URL
app.use(cors({
  origin: allowedOrigins
}));


app.use(morgan('dev')); // Logging middleware
app.use(express.json()); // JSON body parser middleware

// Use the device routes
app.use( deviceRoutes); // Prefix all routes with '/api'

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
