var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
var userHelpers = require('../helpers/user-helpers');
const loginMiddleware = require('../middlewares/loginMiddleware');

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user;
  productHelpers.getAllProducts()
    .then((products) => {
      console.log("User from session: ", user);
      let successMsg = req.session.successMsg;
      res.render('./users/index', { title: "Shopping Cart", products, user, successMsg });
      req.session.successMsg = null;
    });
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    res.render('users/login', { error: req.session.loginError });
    req.session.loginError = null;
  }
});

router.get('/signup', (req, res) => {
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
      res.render('error', { message: err })
    });
});

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body)
    .then((response) => {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.user;
        res.redirect('/');
      } else {
        req.session.loginError = "Invalid credentials";
        res.redirect('/login');
      }
    })
    .catch((err) => {
      console.log("Login error...", err);
      res.render('users/login', { error: "Invalid credentials" });
    });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

router.get('/cart', loginMiddleware,async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id);
  console.log("Cart items: ", products);
  res.render('users/cart');
});

router.get('/add-to-cart/:id', loginMiddleware, (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id)
    .then((response) => {
      console.log("Product added to cart successfully: ", response);
      req.session.successMsg = "Item added to cart successfully";
      res.redirect('/');
    })
    .catch((err) => res.render('error', { message: err }));
});

module.exports = router;
