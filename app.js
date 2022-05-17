//jshint esversion:6
require('dotenv').config()
const dotenv=require('dotenv');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const mongodb = require('mongodb');
const session = require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');
const findOrCreate=require("mongoose-findorcreate");
const MongoClient = mongodb.MongoClient;
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret:"Our little secret.",
  resave:false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb+srv://admin-Eyad:eyad2001@cluster0.2spvg.mongodb.net/UserDB",{useNewUrlParser:true, useUnifiedTopology: true });
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId:String,
    secret:String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
app.get("/",function (req,res) {
  res.render("home")
});
app.get("/login",function (req,res) {
  res.render("login")
});
app.get("/register",function (req,res) {
  res.render("register")
});
app.get("/TinDog",function (req,res) {
  res.render("TinDog")
});
app.get("/TinDog/secrets",function (req,res) {
User.find({"secret":{$ne:null}},function (err,foundUsers) {
  if (err) {
    console.log(err);
  }else {
    if (foundUsers) {
      res.render("secrets",{usersWithSecrets:foundUsers});
    }
  }
});
});

app.get("/submit",function (req,res) {
  if(req.isAuthenticated()){
    res.render("submit");
  }else {
    res.redirect("/login");
  }
});
app.post("/submit",function (req,res) {
  const submittedSecret=req.body.secret;

  //console.log(req.user.id);
  User.findById(req.user.id,function (err,foundUser) {
    if(err){
      console.log(err);
    }else {
      if(foundUser){
        foundUser.secret=submittedSecret;
        foundUser.save(function () {
          res.redirect("/secrets");
        });
      }
    }
  });
});
app.get("/logout",function (req,res) {
  req.logout();
  res.redirect("/");
});
app.get("/secrets",function (req,res) {
  res.redirect("/TinDog/secrets");
});
app.post("/register",function (req,res) {
User.register({username:req.body.username},req.body.password,function (err,user) {
  if(err){
    console.log(err);
res.redirect("/register");
  }else {
    passport.authenticate("local")(req,res,function () {
      res.redirect("/TinDog");
    })
  }
})
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), function(req, res) {
  res.redirect('/TinDog')
});
const port = process.env.PORT;
if(port == null||port == "" ){
  port=3000;
}
app.listen(port,function () {
  console.log("Server has started Successfully");
});
