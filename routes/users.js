var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
var userHelpers = require('../helpers/user-helpers');
const { route } = require('./users');

/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.session.user;
  productHelpers.getAllProducts()
  .then((products) => {
    console.log("User from session: ", user);
  res.render('./users/index', {title: "Shopping Cart", products, user});
  });
});

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.get('/signup', (req, res)=>{
  res.render('users/signup');
});

router.post('/signup', (req, res) => {
  userHelpers.doSignUp(req.body)
  .then((response) => {
    console.log("User inserted successfull: ", response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect('/');
  })
  .catch((err) => {
    console.log(err);
    res.render('error', {message: err})
  });
});

router.post('/login', (req, res)=>{
  userHelpers.doLogin(req.body)
  .then((response) => {
    if(response.status){
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    }else{
      res.render('users/login', {error: "Invalid credentials"});
    }
  })
  .catch((err) => {
    console.log("Login error...", err);
    res.render('users/login', {error: "Invalid credentials"});
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
