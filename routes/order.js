const router = require("express").Router()
const { User } = require("../models/user")
const { Order } = require("../models/order")
const { authenticationToken } = require("./userAuth")

router.post("/place-order", authenticationToken, async(req, res) => {
  try{
    const { id } = req.headers
    const { order } = req.body // in form of array we get from frontend
    for (const oderData of order){
      // adding data to order table
      const newOrder = await Order.create({
        user: id,
        book: oderData._id
      })
      // saving order in user model
      await User.findByIdAndUpdate(id, {
        $push: {
          orders: newOrder._id
        },
        // clearing from cart
        $pull: {
          cart: oderData._id
        }
      })

    }
    return res.status(200).json({
      status: "success",
      msg: "Order placed successfully"
    })
  }catch(err){
    console.log(err);
    res.status(500).json({
      msg: "Internal server error"
    })
  }
} )

// get order history of particular user
router.get("/get-order-history", authenticationToken, async(req, res)=>{
  try{
    const { id } = req.headers
    const userData = await User.findById(id).populate({
      path: "orders",
      populate:{
        path: "book"
      }
    })

    const ordersData = userData.orders.reverse()

    return res.json({
      status: "success",
      data: ordersData
    })
  }catch(err){
    console.log(err);
    return res.status(500).json({
      msg: "An error occured"
    })
  }
})

// get all order history -admin
router.get("/get-all-orders", authenticationToken, async(req, res)=>{
  try{
    const orders = await Order.find()
    .populate({
      path: "book"
    })
    .populate({
      path: "user"
    })
    .sort({createdAt: -1})

    return res.status(200).json({
      status: "success",
      data: orders
    })
  }catch(err){
    console.log(err);
    return res.status(500).json({
      msg: "An error occured"
    })
  }
})

router.put("/update-status/:id", authenticationToken, async(req, res)=>{
  try{
    const { id } = req.params
    await Order.findByIdAndUpdate(id, {status: req.body.status})
    return res.json({
      status: "success",
      msg: "Status updated successfully"
    })
  }catch(err){
    console.log(err);
    return res.status(500).json({
      msg: "An error occured"
    })
  }
})

module.exports = router