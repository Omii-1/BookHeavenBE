const express = require("express")

require ("dotenv").config()
const router = express.Router()
const zod = require("zod")
const { User } = require("../models/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { authenticationToken } = require("./userAuth")

const userBody = zod.object({
  username: zod.string().min(4),
  email: zod.string().email(),
  password: zod.string().min(6),
  address: zod.string()
})

// signup
router.post("/signup", async(req, res) => {
  try {
    const { success } = userBody.safeParse(req.body)
  
    if(!success){
      return res.status(411).json({
        msg: "Email already taken / Incorrect inputs Informations are wrong."
      })
    }
  
    const {username, email, password, address} = req.body

    const existingUser = await User.findOne({
      username: username
    })
  
    if(existingUser){
      return res.status(411).json({
        msg: "User already exist"
      })
    }

    const hashpass = await bcrypt.hash(password, 10)
  
    const user = await User.create({
      username: username, 
      email: email,
      password: hashpass,
      address: address
    })
    
    const authClaims = [
      {id : user._id},
      {role : user.role}
    ]

    const token = jwt.sign(
      {
        authClaims
      },
      process.env.JWT_SECRET, 
      {
        expiresIn: "30d"
      })

    res.status(200).json({
      msg: "User created successfully",
      token: token,
      role: user.role,
      id: user._id
    })

  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error"
    })
  }
})

// signin
router.post("/signin", async(req, res) => {

  try {
    // const { success } = userBody.safeParse(req.body)
  
    // if(!success){
    //   return res.status(411).json({
    //     msg: "Email already taken / Incorrect inputs Informations are wrong."
    //   })
    // }
  
    const {email, password} = req.body

    const existingUser = await User.findOne({
      email: email
    })
  
    if(!existingUser){
      return res.status(411).json({
        msg: "invalid credentials"
      })
    }

    const authClaims = [
      {id : existingUser._id},
      {role : existingUser.role}
    ]

    await bcrypt.compare(password, existingUser.password, (err, data)=> {

      if(data){ 
        const token = jwt.sign(
          {
            authClaims
          },
          process.env.JWT_SECRET, 
          {
            expiresIn: "30d"
          })

        res.status(200).json({
          msg:"Login successfully",
          token: token,
          id : existingUser._id,
          role : existingUser.role
        })
      }else{
        res.status(411).json({
          msg: "incorrect password"
        })
      }

    })
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error"
    })
  }
})

// get user-info
router.get("/user-info", authenticationToken, async(req,  res) => {
  try{
    const { id } = req.headers
    const data = await User.findById(id).select("-password")
    return res.status(200).json({
      userInfo: data
    })
  }catch(err){
    res.status(500).json({
      msg: "Internal server error"
    })
  }
})

// update address
router.put("/update-address", authenticationToken, async(req, res) => {
  try{
    const {id} = req.headers
    const { address } = req.body
    await User.findByIdAndUpdate(id, {address: address})
    return res.status(200).json({
      msg: "Address update successfully"
    })
  }catch(err){
    res.status(411).json({
      err: err,
      msg: "Internal server error"
    })
  }
})

module.exports = router