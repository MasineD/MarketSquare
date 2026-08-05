// ================ Configuration for Database Connection ================
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

pool.on('connect', () => {
    console.log('Connected to the database successfully');
});

pool.on('error', (err) => {
    console.error('Failed to connect to the database', err);
    process.exit(-1);
});

export default pool;