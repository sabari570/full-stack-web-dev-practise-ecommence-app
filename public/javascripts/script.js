const accountDropdownBtn = document.querySelector('.account-dropdown-btn');
const accountDropdownOptions = document.querySelector('.account-dropdown-options');
const cartBadgeCount = document.querySelector('.cart-badge');

// getting the image view element from the edit products
const imageViewElement = document.getElementById("image-view");


// Creating the account button click event
accountDropdownBtn.addEventListener('click', function() {
    console.log("Clicked");
    if (accountDropdownOptions.style.display === 'none' || accountDropdownOptions.style.display === '') {
        accountDropdownOptions.style.display = 'block';
    } else {
        accountDropdownOptions.style.display = 'none';
    }
});

// Script for updating the image src for the newly uploaded image in edit products
function viewImage(event){
    console.log("Choose file clicked");
    imageViewElement.src = URL.createObjectURL(event.target.files[0]);
    console.log(imageViewElement.src);
}

// Writing the ajax code for add to cart functionality
function addToCart (productId){
    console.log("Product id clicked: ", productId);
    // we call the API using AJAX
    $.ajax({
        url: '/add-to-cart/' + productId,
        method: 'get',
        success: (response) => {
            console.log("Response after hitting AJAX request", response);
            if(response.status){
                let count = $(".cart-badge").html();
                count = parseInt(count) + 1;
                $('.cart-badge').html(count);
                alert("Item has been added to cart successfully");
            }else{
                console.log("APi failed: ", response.err);
                window.location.href = "/login";
            }
        }
    });
}