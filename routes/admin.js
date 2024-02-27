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
  const products = [
    {
      title: "Smartphone",
      category: "Electronics",
      description: "A powerful smartphone with advanced features.",
      price: "$32.00",
      image: "https://961souq.com/cdn/shop/files/Apple-iPhone-15-Pro-5_fd0d9d18-4418-405b-a2f4-51714ebc27ec.jpg?v=1695476110"
    },
    {
      title: "Laptop",
      category: "Electronics",
      description: "A sleek and fast laptop for productivity on the go.",
      price: "$72.00",
      image: "https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?cs=srgb&dl=pexels-craig-dennis-205421.jpg&fm=jpg"
    },
    {
      title: "Running Shoes",
      category: "Sportswear",
      description: "Comfortable running shoes designed for performance.",
      price: "$12.00",
      image: "https://contents.mediadecathlon.com/p2153158/e29523738281c7fded2ac3ac130eb55f/p2153158.jpg?format=auto&quality=70&f=650x0"
    },
    {
      title: "Coffee Maker",
      category: "Kitchen Appliances",
      description: "An efficient coffee maker for brewing delicious coffee.",
      price: "$22.00",
      image: "https://images.philips.com/is/image/philipsconsumer/72dbb6e1509a4cacb631ad1900d54b9e?wid=420&hei=360&$jpglarge$"
    }
  ];

  res.render('./admin/view-products', { products })
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
