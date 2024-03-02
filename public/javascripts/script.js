const accountDropdownBtn = document.querySelector('.account-dropdown-btn');
const accountDropdownOptions = document.querySelector('.account-dropdown-options');

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