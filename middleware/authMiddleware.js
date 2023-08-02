const jwt = require("jsonwebtoken");
const User = require("../models/usermodels");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization;
  if (token && token.startsWith("Bearer")) {
    try {
      const decode = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      console.log(req.date);
      req.user = await User.findById(decode.id).select("-password");
      if(req.body.month){
        console.log('got month'+req.body.month);
        req.month = req.body.month;
      }
      next();
    } catch (error) {
        console.log(error);
      res.status(401);
      throw new Error("Not Authorized, Token Failed");
    }
  } else {
    res.status(401);
    throw new Error("Not Authorized, No Token");
  }
});

module.exports = protect;