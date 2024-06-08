const router = require("express").Router()
const { User } = require("../models/user")
const { authenticationToken } = require("./userAuth")

// book add to cart
router.put("/add-cart", authenticationToken, async(req, res)=>{
  try{
    const { bookid, id } = req.body
    const userdata = await User.findById(id)
    const inCart = userdata.cart.includes(bookid)
    if(inCart){
      return res.status(200).json({
        msg: "already in cart"
      })
    }
    await User.findByIdAndUpdate(id, {
      $push: { cart: bookid }
    })

    return res.status(200).json({
      msg: "added to the card",
      book: bookid
    })
  }catch(err){
    console.log(err);
    res.status(500).json({
      msg: "internal server error"
    })
  }
})


// remove book from cart
router.put("/remove-cart/:bookid", authenticationToken, async(req, res) => {
  try{
    const {id} = req.headers
    const{bookid} = req.params
    const user = await User.findById(id)
    const book = user.cart.includes(bookid)
    if(!book){
      return res.status(400).json({
        msg: "book not in cart",
        bookid: bookid
      })
    }
    await User.findByIdAndUpdate(id, {$pull: {
      cart: bookid
    }})
    return res.status(200).json({
      msg: "book remove from the cart.",
      bookid: bookid
    })
  }catch(err){
    res.status(500).json({
      msg: "Internal server error"
    })
  }
})

// get all books from cart
router.get("/cart-books", authenticationToken, async(req, res) => {
  try{
    const { id } = req.headers
    const userdata = await User.findById(id).populate("cart")
    const cart = userdata.cart
    if(!cart || cart.length === 0){
      return res.status(200).json({
        msg: "Cart is empty"
      })
    }
    res.status(200).json({
      msg: "success",
      cart: cart
    })
  }catch(err){
    res.status(500).json({
      msg: "Internal server error"
    })
  }
} )

module.exports = router