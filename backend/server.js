// =========== Configuration for the Express Server ===========
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/database.js'; // Import the database connection pool
import cookieParser from 'cookie-parser'; // Import the cookie-parser middleware
// Import the routes
import authRoutes from './routes/auth.js'; // Import the authentication routes

// Load environment variables from .env file
dotenv.config();

const app = express();
// Frontend URL for CORS configuration
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Default to localhost if not set
// Middleware
app.use(cors({
    origin: frontendURL,
    credentials: true
})); // Enable CORS for the frontend URL with credentials support
app.use(express.json());
app.use(cookieParser()); // Middleware to parse cookies from incoming requests

// // Home route to test server and database connection
// app.get('/', async (req, res) => {
//     res.send('Welcome to the MarketSquare API! The server is running and connected to the database.');
// });
app.use('/auth', authRoutes);

// Start the server
const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});