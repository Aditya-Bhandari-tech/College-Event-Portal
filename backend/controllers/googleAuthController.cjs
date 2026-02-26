// backend/controllers/googleAuthController.js
const User = require('../models/User').default;
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google Token (Supports both ID Token and Access Token)
const verifyGoogleToken = async (credential, accessToken) => {
  if (credential) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (error) {
      throw new Error('Invalid Google ID token');
    }
  } else if (accessToken) {
    try {
      // Use the Google API to verify the access token and get user info
      // This is necessary because useGoogleLogin (implicit flow) returns an access_token
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error_description || 'Invalid access token');

      return {
        sub: data.sub,
        email: data.email,
        name: data.name,
        picture: data.picture,
        email_verified: data.email_verified
      };
    } catch (error) {
      console.error('AccessToken verification error:', error);
      throw new Error('Failed to verify Google access token');
    }
  }
  throw new Error('No Google token provided');
};

// Check if user exists
exports.checkGoogleUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    res.json({
      exists: !!user,
    });
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Google Authentication (Login/Signup)
exports.googleAuth = async (req, res) => {
  try {
    const { credential, accessToken, email, name, googleId, role, branch, phone, year, isGoogleAuth } = req.body;

    // Verify the Google token (either credential or accessToken)
    const googleUser = await verifyGoogleToken(credential, accessToken);

    if (googleUser.email !== email) {
      return res.status(400).json({ message: 'Email mismatch' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - Login flow
      if (!user.isApproved && user.role === 'faculty') {
        return res.status(403).json({
          message: 'Your account is pending approval from admin'
        });
      }

      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branch,
          year: user.year,
          isApproved: user.isApproved,
        },
      });
    }

    // New user - Signup flow
    if (!isGoogleAuth || !role || !branch) {
      return res.json({ needsProfile: true });
    }

    if (role === 'student' && !year) {
      return res.status(400).json({ message: 'Year is required for student accounts' });
    }

    // Create new user
    user = new User({
      name,
      email,
      googleId,
      role,
      branch,
      phone: phone || '',
      year: role === 'student' ? year : undefined,
      password: Math.random().toString(36).slice(-8), // Random password (won't be used)
      isApproved: role === 'student' ? true : false, // Students auto-approved
    });

    await user.save();

    // For students, generate token immediately
    if (role === 'student') {
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branch,
          year: user.year,
          isApproved: user.isApproved,
        },
      });
    }

    // For faculty, return without token (pending approval)
    res.json({
      message: 'Faculty account created. Pending admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
        isApproved: false,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};