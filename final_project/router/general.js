const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log('username: ', username, "password:", password);

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

function getBooks() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const data = books;
            resolve(data);
        }, 1000);
    })
}
// Get the book list available in the shop
public_users.get('/',function (req, res) {
    getBooks()
    .then(data => {
        res.status(200).json({message: JSON.stringify(data)});
    })
    .catch(error => {
        console.error('Error getting books', error);
        res.status(500).send('Internal Server Error');
    })
    
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = parseInt(req.params.isbn);
  console.log("Books.length is " + books.length);
  if (isbn in books){
    let book = books[req.params.isbn];
    return res.status(200).json({message: JSON.stringify(book)});
  }
  else {
    return res.status(300).json({message: `Book not found with ISBN ${isbn}`});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let matches = [];
  let keys = Object.keys(books);
  keys.forEach((key, i) => {
    book = books[key];
    if (author === book.author) {
        matches.push(book);
    }
  })

  if (matches.length > 0) {
    return res.status(200).json({message: JSON.stringify(matches)})
  }
  else {
    return res.status(300).json({message: `No book found by author ${author}`});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let matches = [];
  let keys = Object.keys(books);
  keys.forEach((key, i) => {
    book = books[key];
    if (title === book.title) {
        matches.push(book);
    }
  })

  if (matches.length > 0) {
    return res.status(200).json({message: JSON.stringify(matches)})
  }
  else {
    return res.status(300).json({message: `No book found by title ${title}`});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = parseInt(req.params.isbn);
  if (isbn in books) {
    let book = books[isbn];
    return res.status(200).json({message: book["reviews"]});
  }
  else {
    return res.status(300).json({message: `Book isbn ${isbn} is not found`});
  }
});

module.exports.general = public_users;
