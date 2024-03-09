const accountDropdownBtn = document.querySelector('.account-dropdown-btn');
const accountDropdownOptions = document.querySelector('.account-dropdown-options');
const cartBadgeCount = document.querySelector('.cart-badge');

// getting the image view element from the edit products
const imageViewElement = document.getElementById("image-view");


// Creating the account button click event
accountDropdownBtn.addEventListener('click', function () {
    console.log("Clicked");
    if (accountDropdownOptions.style.display === 'none' || accountDropdownOptions.style.display === '') {
        accountDropdownOptions.style.display = 'block';
    } else {
        accountDropdownOptions.style.display = 'none';
    }
});

// Script for updating the image src for the newly uploaded image in edit products
function viewImage(event) {
    console.log("Choose file clicked");
    imageViewElement.src = URL.createObjectURL(event.target.files[0]);
    console.log(imageViewElement.src);
}

// Writing the ajax code for add to cart functionality
function addToCart(productId) {
    console.log("Product id clicked: ", productId);
    // we call the API using AJAX
    $.ajax({
        url: '/add-to-cart/' + productId,
        method: 'get',
        success: (response) => {
            console.log("Response after hitting AJAX request", response);
            if (response.status) {
                let count = $(".cart-badge").html();
                if(count == null){
                    console.log("now refresh the page");
                    location.reload();
                }
                count = parseInt(count) + 1;
                $('.cart-badge').html(count);
                alert("Item has been added to cart successfully");
            } else {
                console.log("APi failed: ", response.err);
                window.location.href = "/login";
            }
        }
    });
}

// Writing ajax code for updating the quantities of the product when incremented and decremented
const changeProductQuantity = (cartId, prodId, count) => {
    let quantity = parseInt(document.getElementById(prodId).innerHTML);
    count = parseInt(count);
    $.ajax({
        url: '/change-product-quantity',
        data: {
            cartId, prodId, count, quantity
        },
        method: 'post',
        success: (response) => {
            console.log("Response after change product quantity: ", response);
            if (response.removeProduct) {
                alert("Product removed from cart");
                location.reload();  // to reload the page
            } else {
                document.getElementById(prodId).innerHTML = quantity + count;
                document.getElementById('total-billing-amount').innerHTML = response.total;
            }
        },
    });
};

// Writing ajax function to remove the product
const removeProductFromCart = (cartId, prodId) => {
    let confirmed = confirm('Are you sure you want to remove this product?');

    // If user confirms, proceed with the removal
    if (confirmed) {
        $.ajax(
            {
                url: `/remove-cart-product/?cartId=${cartId}&prodId=${prodId}`,
                method: 'delete',
                success: (response) => {
                    console.log("Response after remove: ", response);
                    location.reload();
                }
            }
        );
    } else {
        // If user cancels, do nothing or handle it as required
        console.log("Removal cancelled by user.");
    }
};

// Writing ajax for payment checkout and placing the order either by COD or by online payment
// $("#<id>").submit((e) => {}) => shows grabbing the form by id and taking the submit event and preventing the default submission
// so that we can call the api instead of the default url
$("#checkout-form").submit((e) => {
    e.preventDefault();
    $.ajax(
        {
            url: '/place-order',
            method: 'post',
            data: $('#checkout-form').serialize(),  // -> this is how we can get the data of the form in javascript using jQuery
            success: (response) => {
                if(response.status){
                    window.location.href = '/order-success';
                }
            }
        }
    );
});

// Script for implementing search in admin products
$(document).ready( function () {
    $('#products-table').DataTable();
} );