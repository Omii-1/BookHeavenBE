const router = require("express").Router()
const { User } = require("../models/user")
const { authenticationToken } = require("./userAuth") 

// added book to favourite
router.put("/add-fav", authenticationToken, async(req,res)=> {
  try{
    const { bookid, id } = req.body
    const userdata = await User.findById(id)
    const isBookFavourite = userdata.favourites.includes(bookid)
    if(isBookFavourite){
      return res.status(200).json({
        msg: " Book is already in favourite",
        book: bookid
      })
    }
    await User.findByIdAndUpdate(id, {$push: { favourites: bookid}})
    return res.status(200).json({
      msg: "Book added to favourites",
      book: bookid
    })
  }catch(err){
    res.status(500).json({
      msg: "Internal server error"
    })
  }
})

// remove book to favourite
router.put("/remove-fav", authenticationToken, async(req,res)=> {
  try{
    const { bookid, id } = req.body
    const userdata = await User.findById(id)
    const isBookFavourite = userdata.favourites.includes(bookid)
    if(!isBookFavourite){
      return res.status(400).json({
        msg: " Book not in favourite",
        book: bookid
      })
    }
    await User.findByIdAndUpdate(id, {$pull: { favourites: bookid}})
    return res.status(200).json({
      msg: "Book remove from favourites",
      book: bookid
    })
  }catch(err){
    res.status(500).json({
      msg: "Internal server error"
    })
  }
})

// get all fav books
router.get("/fav-books", authenticationToken, async(req, res)=> {
  try{
    const { id } = req.headers
    const userdata = await User.findById(id).populate("favourites")
    const favBooks = userdata.favourites
    if(!favBooks || favBooks.length === 0){
      return res.status(400).json({
        msg: "Favourites is empty"
      })
    }
    return res.status(200).json({
      msg: "success",
      books: favBooks
    })

  }catch(err){
    console.log(err);
    res.status(500).json({
      msg: "internal server error"
    })
  }
})

module.exports = router