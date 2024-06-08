// middleware to authenticate jwt token from already stored token in header
require("dotenv").config()
const jwt = require("jsonwebtoken")

const authenticationToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if(token == null){
    return res.status(411).json({
      msg: "Authentication token requuired"
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
    if(err){
      return res.status(403).json({
        error: err,
        msg: "Token expired"
      })
    }
    req.user = user
    next()
  })
}

module.exports = {authenticationToken}