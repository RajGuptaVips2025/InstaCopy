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
    
    if (!user) {
      user = await User.create({
        fullName: name,         
        username: name,         
        email,
        profilePicture: picture,
        googleId,               
      });
    }
    
    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.status(200).json({
      message: 'Google authentication successful',
      token,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { googleLogin };

















