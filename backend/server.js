// =========== Configuration for the Express Server ===========
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/database.js'; // Import the database connection pool

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route to test server and database connection
app.get('/', async (req, res) => {
    res.send('Welcome to the MarketSquare API! The server is running and connected to the database.');
});

// Start the server
const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});