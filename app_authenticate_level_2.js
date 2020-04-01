//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

//connect to a mongo database called userDB
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

//create new userSchema with 2 fields - email and password
var userSchema = new mongoose.Schema({
  email: String,
  password:String
});

//define a secret for encryption
const secret = "Thisisourlittlesecret";

//use pluggin to encrypt using secret and mention name of field which needs to be encrypted i.e. password field
userSchema.plugin(encrypt, { secret: secret, encryptedFields:['password'] });

//create new model using user schema
var User = mongoose.model("User", userSchema);

//define a home route
app.get("/", function(req,res){
  res.render("home");
});

//define a login route to render login page
app.get("/login", function(req,res){
  res.render("login");
});

//this code will be executed once login button is clicked on login page
//1. get the request parameters - username and password using bodyParser
//2. using mongoose <modelName>.findOne() method find the matching record for given username and Password
//3. If username is found in db, compare passwords and show the secrets page on successful authentication.
//4. findOne method will automatically decrypt the password, no need to write any decrypt method
app.post("/login", function(req,res){
  const userEmailId = req.body.username;
  const userPassword = req.body.password;

  console.log(userEmailId);
  console.log(userPassword);

  User.findOne({email:userEmailId}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        console.log(foundUser);
        if(foundUser.password === req.body.password){
          console.log(foundUser.password);
          console.log(userPassword);
          res.render("secrets");
        }
      }
    }
  });
});

//post route for registering a new user
//get username and password entered by user and save it to db
app.post("/register", function(req,res){

  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if(!err){
      res.render("secrets");
    }
    else{
      console.log(err);
    }
  })
})

//get route for register page
app.get("/register", function(req,res){
  res.render("register");
});



app.listen(3000, function(){
  console.log("server started at port 3000");
})
