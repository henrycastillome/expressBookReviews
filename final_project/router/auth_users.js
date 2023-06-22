const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const bcrypt=require('bcrypt')

let users = [];

const isValid = (inputUsername)=>{ 
  const user=users.find((user)=>user.username===inputUsername)

  return !!user
}

const authenticatedUser = async (username,password)=>{ 
  const user=users.find((user)=>user.username===username)

  if(!user){
    return false
  }
  const isValidUsername=isValid(username)
  const isValidPassword = await bcrypt.compare(password, user.password);
  return isValidUsername && isValidPassword;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password}=req.body;
  if(!username){
    return res.status(404).json({messsage:"user empty"})
  }
  if(!password){
    return res.status(404).json({message:"Invalid password"})
  }


  if(!authenticatedUser(username, password)){
    return res.status(401).json({error:"username/password invalid"})
  }


  let accessToken=jwt.sign({
    "username":username
  },'access');
  req.session.username = username; 

  req.session.authorization={
    accessToken
  }

  return res.status(200).send("User successfully logged in")
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try{
    const isbn=req.params.isbn
    const review=req.body.review
    const username=req.session.username
    let book_filter=Object.values(books).filter((book)=>book.isbn===isbn)
    const book_reviews=book_filter.map((book)=>book.reviews)
    book_reviews.push({"username":username, "review":review})
  res.send(`The review has been submitted successfully `)

  } catch(err){
    res.status(500).json({error:err.message})
  }
  

});

regd_users.delete("/auth/review/delete/:isbn", (req, res) => {
  try{
    const isbn=req.params.isbn
    const username=req.session.username

    console.log(username)

    let book_filter=Object.values(books).filter((book)=>book.isbn===isbn)

    if (!book_filter){
      return res.status(404).json({error:"Book not found"})
    }

    console.log(book_filter)

    const reviews=book_filter.map((book)=>book.reviews)

    console.log(reviews)

    let user_review=reviews.filter((review)=>{
      return review.username !== username
    })
 
    console.log(user_review)

   

    res.send(`The review has been deleted`)

  } catch(err){
    res.status(500).json({error:err.message})
  }
  

});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
