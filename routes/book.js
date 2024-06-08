const express = require("express")

require ("dotenv").config()
const router = express.Router()
const zod = require("zod")
const { Book } = require("../models/book")
const { User } = require("../models/user")
const jwt = require("jsonwebtoken")
const { authenticationToken } = require("./userAuth")

const bookBody = zod.object({
  url: zod.string(),
  title: zod.string(),
  author: zod.string(),
  desc: zod.string(),
  language: zod.string(),
  price: zod.string()
})

// added new book - admin
router.post("/add-book", authenticationToken, async(req, res) => {
  try {

    const { success } = bookBody.safeParse(req.body)
    if(!success){
      return res.status(411).json({
        msg: "inputs are incorrect"
      })
    }
    const { id } = req.headers
    const { url, title, author, desc, language, price} = req.body
    const user = await User.findById(id)

    if(user.role !== "admin"){
      return res.status(401).json({
        msg: "You dont have access to the admin role."
      })
    }

    const existingBook = await Book.findOne({
      title: title,
      author: author
    })

    if(existingBook){
      return res.status(401).json({
        msg: "book is alrready added you can update it",
        book: title
      })
    }

    const book = await Book.create({
      url: url,
      title: title,
      author: author,
      desc: desc,
      language: language,
      price: price
    })

    res.status(200).json({
      msg: "Book uploaded successfully",
      book: book
    })
  } catch (error) {
    res.status(500).json({
      msg: "Internal server error"
    }) 
  }

})

// update details of books
router.put("/update-book", authenticationToken, async(req, res)=>{
  try{
    const { success } = bookBody.safeParse(req.body)
    if(!success){
      return res.status(411).json({
        msg: "inputs are incorrect"
      })
    }

    const { bookid } = req.headers
    const { url, title, author, desc, language, price} = req.body
    const book = await Book.findByIdAndUpdate(bookid, {
      url: url,
      title: title,
      author: author,
      desc: desc,
      language: language,
      price: price
    })
    return res.status(200).json({
      msg: "book updated successfully",
      book: book
    })
  }catch(err){
    return res.status(500).json({
      msg: "Internal server error"
    })
  }
})

// delete book
router.delete("/delete-book", async(req, res)=>{
  try{
    const {bookid} = req.headers
    await Book.findByIdAndDelete(bookid)
    
    res.status(200).json({
      msg: "book deleted successfully"
    })
  }catch(err){
    res.status(500).json({
      msg: "internal server error"
    })
  }
})

// get all book
router.get("/all-books", async(req,res)=>{
  try{
    const books = await Book.find().sort({createdAt: -1})
    res.status(200).json({
      status: "success",
      books: books
    })
  }catch(err){
    res.status(500).json({
      msg: "internal server error"
    })
  }
})

// give 4 recently added books
router.get("/recent-books", async(req,res)=>{
  try{
    const books = await Book.find().sort({createdAt: -1}).limit(4)
    res.status(200).json({
      status: "success",
      books: books
    })
  }catch(err){
    res.status(500).json({
      msg: "internal server error"
    })
  }
})

// get book by id in params
router.get("/book/:id", async(req, res)=>{
  try{
    const { id } = req.params
    const book = await Book.findById(id)
    res.status(200).json({
      msg: "success",
      book : book
    })

  }catch(err){
    res.status(500).json({
      msg: "internal server error"
    })
  }
})

module.exports = router