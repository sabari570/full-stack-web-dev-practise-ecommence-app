var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
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
  
  res.render('./users/index', {title: "Shopping Cart", products});
});

module.exports = router;
