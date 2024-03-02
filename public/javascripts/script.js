const accountDropdownBtn = document.querySelector('.account-dropdown-btn');
const accountDropdownOptions = document.querySelector('.account-dropdown-options');


// Creating the account button click event
accountDropdownBtn.addEventListener('click', function() {
    console.log("Clicked");
    if (accountDropdownOptions.style.display === 'none' || accountDropdownOptions.style.display === '') {
        accountDropdownOptions.style.display = 'block';
    } else {
        accountDropdownOptions.style.display = 'none';
    }
});