const express = require('express');
const app = express();
const PORT = 3000;
const controller = require("./controllers/controller");
const router = require("./routes/router");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");
require('./passport')(passport); 
const { body, validationResult } = require('express-validator');
const flash = require('connect-flash');



require('dotenv').config();

//middleware


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
// Set path for static files 
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use('/static', express.static(path.join(__dirname, 'public')));
// Set view engine
app.set("view engine", "ejs");

// Save sessions
app.use(session({secret: "cats", resave: false, saveUninitialized: false}));
// Store auth data in sessions
app.use(passport.session());
app.use(flash())
app.use((req, res, next) => {
  res.locals.message = req.flash('error')[0]; // or 'success'
  res.locals.username = req.flash('username')[0];
  res.locals.signuperror = req.flash('signuperror')[0];
  next();
});


// Session Storage, User Data Logic Below (helped by Passport)



app.use('/', router);
// Fallback
app.use((req, res, next) => {
  controller.getHome(req, res);
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});