const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const bcrypt = require("bcrypt");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(404).json({ message: "username empty" });
  }
  if (!password) {
    return res.status(404).json({ message: "password empty" });
  }

  if (users.find((user) => user.username === username)) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const newUser = {
    username,
    password: hashedPassword,
  };

  users.push(newUser);

  res.status(201).json({ message: "user registered successfully" });
});

async function getBooks() {
  return books;
}
// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const booksData = await getBooks();
    res.send(booksData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const bookAsArray = Object.values(books);
    let filter_books = bookAsArray.filter((book) => book.isbn === isbn);
    res.send(filter_books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get book details based on author
async function bookAuthor(author){
  let filter_books = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author
  );
  return filter_books

}
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author.toLowerCase();
    let filter_books= await bookAuthor(author)
    res.send(filter_books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all books based on title
async function bookTitle(title){
  let filter_books = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title
  );

  return filter_books

}
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title.toLowerCase();
    const filter_books= await bookTitle(title)
    res.send(filter_books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Get book review

async function getFilterBook(isbn){
  let filter_books = Object.values(books).filter(
    (book) => book.isbn === isbn
  );
  return filter_books
}
public_users.get("/review/:isbn", async function (req, res) {
  try {
    const isbn =  req.params.isbn;
    const filter_books= await getFilterBook(isbn)
    
    const reviews = filter_books.map((book) => {
      if (book.reviews === null) {
        return { message: "This book does not have reviews" };
      }
      return book.reviews;
    });
    res.send(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.general = public_users;
