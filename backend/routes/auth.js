// ============ Configuring the authentication routes ============
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import protect from '../middleware/auth.js';

const router = express.Router();    //Router instance to define authentication routes.

// Setting up the cookie options for JWT token storage
const cookieOptions = {
    httpOnly: true,   //Ensures that the cookie cannot be accessed via client-side JavaScript, enhancing security against XSS attacks.
    secure: true,     //Ensures that the cookie is only sent over HTTPS.
    maxAge: 24 * 60 * 60 * 1000 // Sets the cookie to expire in 24 hours.
};

const generateToken = (id, user_role) => {   //Function to generate a JWT token for a given user.
    return jwt.sign(
        {id, user_role},   //Payload containing the user's ID and role.
        process.env.JWT_SECRET,   //Secret key used to sign the token, stored in environment variables.
        {expiresIn: '1d'}   //Token expiration time set to 1 day.
    );
}