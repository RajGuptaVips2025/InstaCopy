// controllers/googleAuthController.js

const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema'); 
const { oauth2client } = require('../config/googleConfig'); 

const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;
    console.log(code)
    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);
    
    const userInfoResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    
    const { email, name, picture, id: googleId } = userInfoResponse.data;
    
    let user = await User.findOne({ email });
    let isNewUser = false;
    
    if (!user) {
      isNewUser = true;
      // 💡 NEW LOGIC: Generate a unique, but ugly, placeholder username
      // We use part of the Google ID to guarantee uniqueness, 
      // ensuring the DB insert succeeds and future lookups by this placeholder work.
      const baseUsername = name.toLowerCase().replace(/\s/g, '');
      const uniqueIdSuffix = googleId.slice(-6); // Last 6 chars of Google ID
      const placeholderUsername = `${baseUsername}-${uniqueIdSuffix}`; 

      user = await User.create({
        fullName: name,         
        username: placeholderUsername,         
        email,
        profilePicture: picture,
        googleId, 
        // 🛑 OPTIONAL: Add a flag to guide redirect on frontend
        needsUsername: true,              
      });
    }

    // Check if the user has the 'needsUsername' flag (for returning users 
    // from the duplicate-name era, and newly created ones)
    const needsUsername = isNewUser || user.username.includes('-'); // Or use a dedicated DB flag
    
    // const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const token = jwt.sign(
      { id: user._id, email, needsUsername: user.needsUsername || isNewUser }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.status(200).json({
      message: 'Google authentication successful',
      token,
      user: { ...user.toObject(), needsUsername: isNewUser || user.needsUsername } // Send the flag to the frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { googleLogin };