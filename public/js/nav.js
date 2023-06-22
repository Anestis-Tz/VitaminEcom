const createNav = () => {
    let nav = document.querySelector('.navBar');

    nav.innerHTML = `
        <div class="nav">
           <!-- <img src="../img/dark-logo.png" class="brand-logo" alt=""> -->
            <div class="nav-items">
            <a class="link-home" onclick="location.href='http://localhost:3000/'">
                <span id="title">
                    Vitamin Shop
                </span>
            </a>
                <div class="search">
                    <input type="text" class="search-box" placeholder="search brand, product">
                    <button class="search-btn">search</button>
                </div>
                <a>
                    <img src="../img/PngItem_1468843.png" id="user-img" alt="">
                    <div class="login-logout-popup hide">
                        <p class="account-info">Log in as, name</p>
                        <button class="btn" id="user-btn">Log out</button>
                    </div>
                </a>
                <a href="/cart"><img src="../img/shopping-cart-xxl.png" alt=""></a>
            </div>
        </div>
        <ul class="links-container">
            <li class="link-item"><a onclick="location.href='http://localhost:3000/'" class="link">Home</a></li>
            <li class="link-item"><a onclick="location.href='http://localhost:3000/seller'" class="link">Become a Seller</a></li>
            <li class="link-item"><a onclick="location.href='http://localhost:3000/contact'" class="link">Contact</a></li>
        </ul>
    `;
}

createNav();

// nav popup
const userImageButton = document.querySelector('#user-img');
const userPopup = document.querySelector('.login-logout-popup');
const popuptext = document.querySelector('.account-info');
const actionBtn = document.querySelector('#user-btn');

userImageButton.addEventListener('click', () => {
    userPopup.classList.toggle('hide');
})

window.onload = () => {
    let user = JSON.parse(sessionStorage.user || null);
    if(user != null){
        // means user is logged in
        popuptext.innerHTML = `logged in as, ${user.name}`;
        actionBtn.innerHTML = 'log out';
        actionBtn.addEventListener('click', () => {
            sessionStorage.clear();
            location.reload();
        })
    } else{
        // user is logged out
        popuptext.innerHTML = 'log in to place order';
        actionBtn.innerHTML = 'log in';
        actionBtn.addEventListener('click', () => {
            location.href = '/login';
        })
    }
}

// search box

const searchBtn = document.querySelector('.search-btn'); //selecting search button and box
const searchBox = document.querySelector('.search-box');
searchBtn.addEventListener('click', () => { //adding click event
    if(searchBox.value.length){ //condition check for value length
        location.href = `/search/${searchBox.value}` //if condition true redirect user to search page
    }
})