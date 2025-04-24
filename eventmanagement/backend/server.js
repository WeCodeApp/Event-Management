import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import bodyParser from 'body-parser';

// Configure dotenv
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'eventmanagement',
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

// Email regex for basic validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ======================== Register ========================
app.post('/api/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  try {
    const [existingUser] = await connection.promise().query('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.promise().query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(200).json({ success: true, message: 'User registered successfully!' });
  } catch (error) {
    console.error('🔴 Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ======================== Login ========================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const [rows] = await connection.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('🔴 Login error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ======================== Reset Password ========================
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  // Input validation
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: "Email and new password are required." });
  }

  try {
    // Check if the email exists in the database
    const [user] = await connection.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'No email records found in our database.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password for the user
    await connection.promise().query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    res.json({ success: true, message: 'Password has been successfully reset!' });
  } catch (error) {
    console.error('🔴 Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password. Please try again later.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
