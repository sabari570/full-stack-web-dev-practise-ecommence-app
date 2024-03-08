var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
var userHelpers = require('../helpers/user-helpers');
const loginMiddleware = require('../middlewares/loginMiddleware');

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartProductsCount(user._id);
  }
  productHelpers.getAllProducts()
    .then((products) => {
      console.log("User from session: ", user);
      res.render('./users/index', { title: "Shopping Cart", products, user, cartCount });
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

router.get('/cart', loginMiddleware, async (req, res) => {
  try {
    let products = await userHelpers.getCartProducts(req.session.user._id);
    console.log("Cart items: ", products);
    res.render('users/cart', { products, user: req.session.user });
  } catch (err) {
    console.log("Error while fetching data: ", err);
    res.render('users/cart', { user: req.session.user });
  }
});

router.get('/add-to-cart/:id', (req, res) => {
  console.log("API call..");
  if (!req.session.loggedIn) {
    res.json({ status: false });
  } else {
    userHelpers.addToCart(req.params.id, req.session.user._id)
      .then((response) => {
        console.log("Product added to cart successfully: ", response);
        res.json({ status: true });
        // res.redirect('/');
      })
      .catch((err) => {
        // res.render('error', { message: err });
        res.json({ status: false, err })
      });
  }
});

module.exports = router;
