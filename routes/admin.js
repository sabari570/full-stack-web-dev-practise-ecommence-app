var express = require('express');
var router = express.Router();
var Handlebars = require('handlebars');
const { route } = require('./users');
const productHelpers = require('../helpers/product-helpers');

// Function to increment the count of the index by 1 

Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelpers.getAllProducts()
  .then((products) => {
    console.log(products);
    res.render('./admin/view-products', { products })
  });
});

router.get('/add-product', (req, res) => {
  res.render('./admin/add-product');
});

router.post('/add-product', (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    if (id) {
      let image = req.files.image;

      //Getting the image name and the extension
      let imagePath = image.name;
      const parts = imagePath.split('.');
      const extension = parts[parts.length - 1];

      // Moving the image to a product images folder
      image.mv('./public/product-images/' + id + '.' + extension, (err, done) => {
        if (!err) {
          res.render("admin/add-product");
        }else{
          console.log(err);
        }
      });
    } else {
      console.log("Database insertion failed");
    }
  });
});

module.exports = router;
