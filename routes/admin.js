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
          res.redirect('/admin');
        }else{
          console.log(err);
        }
      });
    } else {
      console.log("Database insertion failed");
    }
  });
});

// Using URL params for deleting the product with product id
router.get('/delete-product/:id', (req, res) => {
  let prodId = req.params.id;
  productHelpers.deleteProduct(prodId)
  .then((response) => {
    res.redirect('/admin');
  })
  .catch((err) => {
    console.log("Admin product deletion error: ", err);
    res.render('error', {message: "Product not found"});
  });
});

//Using Query parameters for editing the product
router.get("/edit-product", (req, res) => {
  // Method of extracting the query parameter
  let prodId = req.query.id;
  productHelpers.getProductDetails(prodId)
  .then((response) => {
    console.log(response);
    res.render('admin/edit-product', {product: response});
  })
  .catch((err) => {
    console.log("Fetching error for update product: ", err);
    res.render('error', {message: err});
  });
});

// Product id is kept in a field that is hidden from the user instead of passing it through the URL
router.post('/edit-product', (req, res) => {
  productHelpers.updateProduct(req.body)
  .then((response) => {
    // After updating the product we update the image if any image is uploaded
    res.redirect('/admin');

    // Now uploading the image to server if any image file is uploaded
    if(req.files.image){
      let image = req.files.image;
      let imageId = req.body.prodId;
      image.mv('./public/product-images/' + imageId + '.jpeg', (err) => {
        if(err) console.log("Error while uploading the image: ", err);
      });
    }
  })
  .catch((err) => res.render('error', {message: err}));
});

module.exports = router;
