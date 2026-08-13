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
    sameSite: 'strict', //Prevents the browser from sending this cookie along with cross-site requests, providing protection against CSRF attacks.
    maxAge: 24 * 60 * 60 * 1000 // Sets the cookie to expire in 24 hours.
};
//Function to generate a JWT token for a given user.
const generateToken = (id, user_role) => {
    return jwt.sign(
        {id, user_role},   //Payload containing the user's ID and role.
        process.env.JWT_SECRET,   //Secret key used to sign the token, stored in environment variables.
        {expiresIn: '1d'}   //Token expiration time set to 1 day.
    );
}
// An endpoint for user registration. It handles the creation of new users in the database.
router.post('/sign-up', async (req, res) => { 
    // Checking if the user already exists in the database, and registering new user if one does not exist.
    try {
        const { fullname, email, phone, password, company_name, primary_service, company_registration, user_role } = req.body;   //Extracts user details from the request body.
        // Checking user input
        if (!fullname || !email || !phone || !password || !user_role) {
            return res.status(400).json({ message: 'Please fill in all required fields' });   //Returns a 400 Bad Request response if any required fields are missing.
        }
        // console.log('Received registration data:', req.body);   //Logs the received registration data for debugging purposes.
        const existingUserEmail = await pool.query('SELECT * FROM users.profiles WHERE email = $1', [email]);
        console.log('Checking for existing user with email:', email);   //Logs a message indicating that the system is checking for an existing user with the provided email.
        if (existingUserEmail.rows.length > 0) {
            // console.log('User with this email already exists:', email);   //Logs a message indicating that a user with the provided email already exists.
            return res.status(400).json({ message: 'User with this email already exists' });   //Returns a 400 Bad Request response if the user already exists.
        }
        // console.log('No user found with this email, proceeding with registration:', email);   //Logs a message indicating that no user was found with the provided email, and registration will proceed.
        const existingUserCompany = await pool.query('SELECT * FROM users.profiles WHERE company_name = $1', [company_registration]);
        if (existingUserCompany.rows.length > 0) {
            return res.status(400).json({ message: 'Company with this registration number already exists' });   //Returns a 400 Bad Request response if the company already exists.
        }
        // Validate phone number (exactly 10 digits) to match database constraints
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }
        // Hashing the password before storing it in the database for security purposes.
        const salt = await bcrypt.genSalt(10);   //Generates a salt for hashing the password.
        const hashedPassword = await bcrypt.hash(password, salt);   //Hashes the password using the generated salt.
        // Checking the user role and inserting the new user into the database accordingly.
        console.log('Registering new user with role:', user_role);   //Logs a message indicating the role of the new user being registered.
        let newUser;
        if (user_role.toLowerCase() === 'buyer') {
            newUser = await pool.query(
                `INSERT INTO users.profiles (fullname, email, phone, password, user_role)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,[fullname, email, phone, hashedPassword, user_role.toLowerCase()])
        } else if (user_role.toLowerCase() === 'seller') {
            newUser = await pool.query(
                `INSERT INTO users.profiles (fullname, email, phone, password, company_name, primary_service, company_registration, user_role)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,[fullname, email, phone, hashedPassword, company_name, primary_service, company_registration, user_role.toLowerCase()])
        } else {
            return res.status(400).json({ message: 'User role must be buyer or seller' });
        }
        // Generating a JWT token for the newly registered user and setting it in the response cookies.
        const token = generateToken(newUser.rows[0].id, newUser.rows[0].user_role);   //Generates a JWT token for the new user.
        res.cookie('token', token, cookieOptions);   //Sets the JWT token in the response cookies with the defined options.
        return res.status(201).json({ message: 'Account registered successfully', user: newUser.rows[0] });
    } catch (error) {
        console.error('Account registration failed:', error.message);   //Logs any errors that occur during the registration process to the console for debugging purposes.
        res.status(500).json({ message: 'Account registration failed' });   //Returns a 500 Internal Server Error response with an error message if something goes wrong during registration.
    }
});
// An endpoint to sign up with Google OAuth. It handles the authentication of users using their Google account and returns a JWT token upon successful login.
router.post('/google-signup', async (req, res) => {
    try {
        const { fullname, email, user_role } = req.body;   //Gets the fullname and email from the request body.
        if(!fullname || !email || !user_role) {   //Checks if fullname, email, and user_role are provided.
            return res.status(400).json({ message: 'Fullname, email, and user role are required for Google signup' });   //Returns a 400 Bad Request response if any of the required fields is missing.
        }
        // Check if a user already exists with the provided Google email
        const existingUser = await pool.query('SELECT * FROM users.profiles WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });   //Returns a 400 Bad Request response if a user with the provided email already exists.
        }
        // Create a new user in the database with the provided Google account information
        const newUser = await pool.query(
            `INSERT INTO users.profiles (fullname, email, user_role) VALUES ($1, $2, $3) RETURNING *`, [fullname, email, user_role.toLowerCase()]
        );
        // Generating a JWT token for the newly registered user and setting it in the response cookies.
        const token = generateToken(newUser.rows[0].id, newUser.rows[0].user_role);   //Generates a JWT token for the new user.
        res.cookie('token', token, cookieOptions);   //Sets the JWT token in the response cookies with the defined options.
        return res.status(201).json({ message: 'Account registered successfully', user: newUser.rows[0] });
    } catch (error) {
        console.error('Google signup failed:', error.message);
        res.status(500).json({ message: 'Google signup failed' });
    }
});
// An endpoint for user login. It handles the authentication of users and returns a JWT token upon successful login.
router.post('/sign-in', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await pool.query('SELECT * FROM users.profiles WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify the password
        const isMatch = await bcrypt.compare(password, user.rows[0].password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = generateToken(user.rows[0].id, user.rows[0].user_role);

        // Set the JWT token in a cookie
        res.cookie('token', token, cookieOptions);

        return res.status(200).json({ message: 'Login successful', user: user.rows[0] });
    } catch (error) {
        console.error('Login failed:', error.message);
        res.status(500).json({ message: 'Login failed' });
    }
});
// An endpoint to check if user has an account before allowing continuation with google sign-in. It checks if a user with the provided email exists in the database.
router.post('/google-signin', async (req, res) => {
    try {
        const { email } = req.body;   //Extracts the email from the request body.
        if(!email) {   //Checks if the email is provided.
            return res.status(400).json({ message: 'Email is required to check for existing Google user' });   //Returns a 400 Bad Request response if the email is not provided.
        }
        const user = await pool.query('SELECT * FROM users.profiles WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found. Sign up first.' });
        }
        // Generate a JWT token
        const token = generateToken(user.rows[0].id, user.rows[0].user_role);

        // Set the JWT token in a cookie
        res.cookie('token', token, cookieOptions);

        return res.status(200).json({ message: 'Login successful', user: user.rows[0] });
    } catch (error) {
        console.error('Failed to check Google user:', error.message);
        res.status(500).json({ message: 'Failed to check Google user' });
    }
});
// An endpoint to get the current authenticated user's information. It uses the protect middleware to ensure that only authenticated users can access this route.
router.get('/me', protect, async (req, res) => {
    try {
        const user = await pool.query('SELECT * FROM users.profiles WHERE id = $1', [req.user.id]);
        return res.status(200).json({ user: user.rows[0] });
    } catch (error) {
        console.error('Failed to fetch current user information:', error.message);
        res.status(500).json({ message: 'Failed to fetch current user information' });
    }
});
// An endpoint for user logout. It clears the JWT token from the cookies, effectively logging the user out of the application.
router.post('/sign-out', (req, res) => {
    res.clearCookie('token', cookieOptions);   //Clears the JWT token from the response cookies using the defined options.
    return res.status(200).json({ message: 'Logout successful' });   //Returns a 200 OK response with a success message indicating that the user has been logged out.
});

// -----------Endpoints for password reset and change functionality-----------
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, phone } = req.body;
        
        // Check if at least one is provided
        if (!email && !phone) {
            return res.status(400).json({ message: 'Either email or phone number is required' });
        }
        
        let user;
        let contactInfo;
        
        // Check if user exists with email or phone
        if (email) {
            const result = await pool.query('SELECT * FROM users.profiles WHERE email = $1', [email]);
            user = result.rows[0];
            contactInfo = email;
        } else if (phone) {
            const result = await pool.query('SELECT * FROM users.profiles WHERE phone = $1', [phone]);
            user = result.rows[0];
            contactInfo = phone;
        }
        
        if (!user) {
            return res.status(404).json({ message: 'No user found with the provided details' });
        }
        
        // Optional: Invalidate any existing unused OTPs for this user
        const invalidateQuery = `
            UPDATE users.forgot_password 
            SET is_used = TRUE, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = $1 AND is_used = FALSE
        `;
        await pool.query(invalidateQuery, [user.id]);
        
        // Generate a One-Time-Pin (OTP) for password reset
        const otp = generateOTP(); // Assuming this function generates a 6-digit OTP
        
        // Set expiration time to 30 seconds from now
        const expiresAt = new Date(Date.now() + 1 * 60000); // 30 seconds in milliseconds
        
        // Insert the new OTP record into the forgot_password table
        const insertQuery = `
            INSERT INTO users.forgot_password (
                user_id, 
                otp, 
                contact_info, 
                expires_at
            ) VALUES ($1, $2, $3, $4)
            RETURNING id, otp, expires_at
        `;
        
        const insertResult = await pool.query(insertQuery, [
            user.id, 
            otp, 
            contactInfo, 
            expiresAt
        ]);
        
        const resetRecord = insertResult.rows[0];
        
        // Determine the contact method for the response message
        const contactMethod = email ? 'email' : 'phone';
        
        // Send the OTP via email or SMS
        if (email) {
            // await sendOTPByEmail(email, otp);
            console.log(`OTP ${otp} sent to email: ${email}`);
            console.log(`OTP expires at: ${expiresAt}`);
        } else if (phone) {
            // await sendOTPBySMS(phone, otp);
            console.log(`OTP ${otp} sent to phone: ${phone}`);
            console.log(`OTP expires at: ${expiresAt}`);
        }
        
        return res.status(200).json({ 
            message: `Password reset instructions sent to your ${contactMethod}. OTP expires in 30 seconds.`,
            // For security, don't include OTP in response in production
            resetId: resetRecord.id,
            expiresAt: expiresAt // Optional: include for frontend countdown timer
        });
        
    } catch (error) {
        console.error('Failed to initiate password reset:', error.message);
        res.status(500).json({ message: 'Failed to initiate password reset' });
    }
});
/* A function to generate One-Time-Pin (OTP) for password reset. 
 This function generates a random 6-digit number to be used as an OTP for verifying the user's identity during the password reset process.*/
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a random 6-digit number and converts it to a string.
};
// An endpoint to verify OTP after it has been sent
// Simpler version - just validates the OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, phone, otp } = req.body;
        
        // Validate required fields
        if (!otp) {
            return res.status(400).json({ 
                message: 'OTP is required' 
            });
        }
        
        if (!email && !phone) {
            return res.status(400).json({ 
                message: 'Either email or phone number is required' 
            });
        }
        
        // Find user by email or phone
        let user;
        
        if (email) {
            const result = await pool.query('SELECT * FROM users.profiles WHERE email = $1', [email]);
            user = result.rows[0];
        } else if (phone) {
            const result = await pool.query('SELECT * FROM users.profiles WHERE phone = $1', [phone]);
            user = result.rows[0];
        }
        
        if (!user) {
            return res.status(404).json({ 
                message: 'No user found with the provided details' 
            });
        }
        
        // Verify the OTP
        const otpQuery = `
            SELECT * FROM users.forgot_password 
            WHERE user_id = $1 
            AND otp = $2 
            AND is_used = FALSE 
            AND expires_at > CURRENT_TIMESTAMP
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        
        const otpResult = await pool.query(otpQuery, [user.id, otp]);
        
        if (otpResult.rows.length === 0) {
            // Check if OTP exists but expired
            const expiredQuery = `
                SELECT * FROM users.forgot_password 
                WHERE user_id = $1 
                AND otp = $2 
                AND is_used = FALSE 
                AND expires_at <= CURRENT_TIMESTAMP
                ORDER BY created_at DESC 
                LIMIT 1
            `;
            
            const expiredResult = await pool.query(expiredQuery, [user.id, otp]);
            
            if (expiredResult.rows.length > 0) {
                return res.status(400).json({ 
                    message: 'OTP has expired. Please request a new one.',
                    expired: true
                });
            }
            
            return res.status(400).json({ 
                message: 'Invalid OTP. Please check and try again.' 
            });
        }
        
        const resetRecord = otpResult.rows[0];
        
        // Calculate time remaining
        const now = new Date();
        const expiresAt = new Date(resetRecord.expires_at);
        const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        
        return res.status(200).json({ 
            message: 'OTP verified successfully',
            verified: true,
            resetId: resetRecord.id,
            userId: user.id,
            timeRemaining: timeRemaining,
            user: {
                id: user.id,
                email: user.email,
                fullname: user.fullname,
                user_role: user.user_role
            }
        });
        
    } catch (error) {
        console.error('Failed to verify OTP:', error.message);
        res.status(500).json({ 
            message: 'Failed to verify OTP. Please try again.' 
        });
    }
});
export default router;   //Exports the router instance so that it can be imported and used in other parts of the application to handle authentication routes.
