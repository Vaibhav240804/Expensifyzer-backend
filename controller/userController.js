const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/usermodels");
const axios = require("axios");
const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, password2 } = req.body;
  if (req.body.withGoogle) {
    // google oauth
    axios
      .get("http://localhost:5000/auth/google")
      .then(async (response) => {
        const firstName = response.data.given_name;
        const lastName = response.data.family_name;
        const email = response.data.email;

        const alreadyExistUser = await User.findOne({ email });
        if (alreadyExistUser) {
          const token = generateToken(alreadyExistUser._id);
          res.status(200).json({ user:result, token });
        }
        const result = await User.create({
          name: `${firstName} ${lastName}`,
          email: email,
        });
        const token = generateToken(result._id);
        res.status(200).json({ user:result, token });
      }).catch((err) => {
        res.status(400).json({ message: err });
      });
  } 
  else {
    
    if ((!name || !email || !password || !password2) || password !== password2) {
      if(password !== password2){
        res.status(400);
        throw new Error("Passwords do not match");
      }
      res.status(400);
      throw new Error("Please fill all the fields");
    }

    const userExits = await User.findOne({ email });
    if (userExits) {
      res.status(400);
      throw new Error("User Already Exits");
    }
    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid User Data");
    }
  }
});

const loginUser = asyncHandler(async (req, res) => {
  if (req.body.googleAccessToken) {
    // google oauth
    axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        Headers: {
          Authorization: `Bearer ${req.body.googleAccessToken}`,
        },
      })
      .then(async (response) => {
        const firstName = response.data.given_name;
        const lastName = response.data.family_name;
        const email = response.data.email;

        const alreadyExistUser = await User.findOne({ email });
        if (!alreadyExistUser) {
          const result = await User.create({
            name: `${firstName} ${lastName}`,
            email,
          });
          const token = generateToken(result._id);
          res.status(200).json({ user: alreadyExistUser, token });
        }
        const token = generateToken(alreadyExistUser._id);
        res.status(200).json({ user:alreadyExistUser, token });
      }).catch((err) => {
        res.status(400).json({ message: err });
      });
  } 
  else{
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  const user = await User.findOne({ email });
  if(!user){
    res.status(400);
    throw new Error("User doesn't exit, please sign up first");
  }
  else if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    console.log('failed');
    res.status(400);
    throw new Error("Invalid credentials");
  }
}
});


const getUserProfile = asyncHandler(async (req, res) => {
  // const { id, name, email } = await User.findById(req.user._id);

  res.status(200).json({
    id: id,
    name: name,
    email: email,
  });
});

// generate jwt
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
