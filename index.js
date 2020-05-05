var express = require('express');
var multer = require('multer');
var app = express();
var path = require('path');
const fs = require('fs');
var bodyParser = require('body-parser');
var upload = multer();
var mongoose = require('mongoose');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser());
mongoose.connect('mongodb://localhost/my_db');

// parsing
// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));

const port = 3000;
//imports the things.js module
app.set('view engine', 'pug');
app.set('views', './views');

var personSchema = mongoose.Schema({
    name: String,
    age: Number,
    nationality: String
});
var Person = mongoose.model("Person", personSchema);



app.get('/person', function(req, res){
    res.render('person');
});

app.use(session({secret: "Your secret key"}));

var Users = [];

app.get('/', function(req, res){
   if(req.session.page_views){
      req.session.page_views++;
      res.send("You visited this page " + req.session.page_views + " times");
   } else {
      req.session.page_views = 1;
      res.send("Welcome to this page for the first time!");
   }
});

app.get('/signup', function(req, res){
    res.render('signup');
 });
 
app.post('/signup', function(req, res){
    if(!req.body.id || !req.body.password){
        res.status("400");
        res.send("Invalid details!");
    } 
    else {
        Users.filter(function(user){
            if(user.id === req.body.id){
                res.render('signup', {
                message: "User Already Exists! Login or choose another user id"});
            }
        });
        var newUser = {id: req.body.id, password: req.body.password};
        Users.push(newUser);
        req.session.user = newUser;
        res.redirect('/protected_page');
        console.log(Users);
    }
});

function checkSignIn(req, res){
   if(req.session.user){
      next();     //If session exists, proceed to page
   } else {
      var err = new Error("Not logged in!");
      console.log(req.session.user);
      next(err);  //Error, trying to access unauthorized page!
   }
}
app.get('/protected_page', checkSignIn, function(req, res){
   res.render('protected_page', {id: req.session.user.id})
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/login');
});

app.use('/protected_page', function(err, req, res, next){
console.log(err);
   //User should be authenticated! Redirect him to log in.
    res.redirect('/login');
});

function checkSignIn(req, res, next){
    if(req.session.user){
        next();     //If session exists, proceed to page
    } 
    else {
        var err = new Error("Not logged in!");
        console.log(req.session.user);
        next(err);  //Error, trying to access unauthorized page!
    }
}
app.get('/protected_page', checkSignIn, function(req, res){
    res.render('protected_page', {id: req.session.user.id});
});

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', function(req, res){
    console.log(Users);
    if(!req.body.id || !req.body.password){
        res.render('login', {message: "Please enter both id and password"});
    } 
    else {
        Users.filter(function(user){
            if(user.id === req.body.id && user.password === req.body.password){
                req.session.user = user;
                res.redirect('/protected_page');
                return
            }
            else {
                res.render('login', {message: "Invalid credentials!"});
            }
        });
    }
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/login');
});

app.use('/protected_page', function(err, req, res, next){
    console.log(err);
    res.redirect('/login');
});


app.post('/person', function(req, res){
    var personInfo = req.body; //Get the parsed information  
    if(!personInfo.name || !personInfo.age || !personInfo.nationality){
        res.render('show_message', {
            message: "Sorry, you provided wrong info", type: "error"});
    } 
    else {
        var newPerson = new Person({
            name: personInfo.name,
            age: personInfo.age,
            nationality: personInfo.nationality
        });
        
        

        newPerson.save(function(err, Person){
            if(err)
                res.render('show_message', {message: "Database error", type: "error"});
            
            else
                res.render('show_message', {
                    message: "New person added", type: "success", person: personInfo});
        });
    }
});

//Format: Model.find(conditions, callback)
//no conditions, return all documents from Person collection
Person.find(function(err, response){
});


//name and age condition, returns matches
Person.find({name: "Ayy", age: 10}, 
   function(err, response){
});

//returns only 'name's of matches
Person.find({nationality: "United States"}, "name", function(err, response){
});

//Format: Model.findById(id, callback)

Person.findById("5ea8b790ee82aa0c16def5d2", function(err, response){
});

Person.update({nationality: "United States"}, {age: 19}, function(err, response){
    Person.find(function(err, response){
    });
});

app.get('/people', function(req, res){
    Person.find(function(err, response){
        res.json(response);
    });
});

app.get('/', function(req, res){
    res.render('form');
});

app.put('/people/:id', function(req, res){
    Person.findByIdAndUpdate(req.params.id, req.body, function(err, response){
        if(err) res.json({message: "Error in updating person with id " + req.params.id});
        res.json(response);
    });
});


app.listen(3000);