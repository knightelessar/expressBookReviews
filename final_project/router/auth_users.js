const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const review = req.body.review;
    const isbn = parseInt(req.params.isbn);
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        let username = req.session.authorization['username'];
        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                let book = books[isbn]
                book["reviews"][username] = review;
                return res.status(200).json({message: "Review added"});
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = parseInt(req.params.isbn);
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        let username = req.session.authorization['username'];
        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                let book = books[isbn];
                reviews = book["reviews"];
                if (username in reviews) {
                    delete reviews[username];
                    return res.status(200).json({message: "Review deleted"});
                } 
                else {
                    return res.status(200).json({message: "No review existing"})
                }
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
