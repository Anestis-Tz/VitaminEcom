const productImages = document.querySelectorAll(".product-images img"); // selecting all image thumbs
const productImageSlide = document.querySelector(".image-slider"); // seclecting image slider element

let activeImageSlide = 0; // default slider image

productImages.forEach((item, i) => { // loopinh through each image thumb
    item.addEventListener('click', () => { // adding click event to each image thumbnail
        productImages[activeImageSlide].classList.remove('active'); // removing active class from current image thumb
        item.classList.add('active'); // adding active class to the current or clicked image thumb
        productImageSlide.style.backgroundImage = `url('${item.src}')`; // setting up image slider's background image
        activeImageSlide = i; // updating the image slider variable to track current thumb
    })
})

// toggle size buttons

const sizeBtns = document.querySelectorAll('.size-radio-btn'); // selecting size buttons
let checkedBtn = 0; // current selected button
let size;

sizeBtns.forEach((item, i) => { // looping through each button
    item.addEventListener('click', () => { // adding click event to each 
        sizeBtns[checkedBtn].classList.remove('check'); // removing check class from the current button
        item.classList.add('check'); // adding check class to clicked button
        checkedBtn = i; // upading the variable
        size = item.innerHTML; 
    })
})
 
const setData = (data) => {
    let title = document.querySelector('title'); //selecting title element
    title.innerHTML += data.name; //using innerhtml to set titles content

    //setup the images
    productImages.forEach((img, i) =>{ //looping through each image 
        if(data.images[i]){ //checking if it exists or not in the data
            img.src = data.images[i]; //setting the images src to data.images of i index
        } else{
            img.style.display = 'none'; //if data does not have the image hide the image using style method
        }
    })
    productImages[0].click(); //select first image and click on it using click method which will set up the carousel image

    //setup size buttons
    sizeBtns.forEach(item => { 
        if(!data.sizes.includes(item.innerHTML)){ //checking if size is inside data.sizes or not
            item.style.display = 'none'; //if condition is true hide the button  
        }
    })

    //setting up texts
    const name = document.querySelector('.product-brand');
    const shortDes = document.querySelector('.product-short-des');
    const des = document.querySelector('.des');

    //using innner html to set each element's content
    title.innerHTML += name.innerHTML = data.name;
    shortDes.innerHTML = data.shortDes;
    des.innerHTML = data.des;

    // pricing
    const sellPrice = document.querySelector('.product-price');
    const actualPrice = document.querySelector('.product-actual-price');
    const discount = document.querySelector('.product-discount');

    sellPrice.innerHTML = `$${data.sellPrice}`;
    actualPrice.innerHTML = `$${data.actualPrice}`;
    discount.innerHTML = `( ${data.discount}% off )`;

    // wishlist and cart btn
    const wishlistBtn = document.querySelector('.wishlist-btn'); 
    wishlistBtn.addEventListener('click', () => {
        wishlistBtn.innerHTML = add_product_to_cart_or_wishlist('wishlist', data); //setting its innerhtml by calling the add to cart function
    })

    const cartBtn = document.querySelector('.cart-btn');
    cartBtn.addEventListener('click', () => {
        cartBtn.innerHTML = add_product_to_cart_or_wishlist('cart', data);
    })
}

// fetch data
const fetchProductData = () => { 
    fetch('/get-products', { //using fetch to make post request to get product's route
        method: 'post',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({id: productId}) 
    })
    .then(res => res.json()) //using then block to respond to the data
    .then(data => { 
        setData(data);
        getProducts(data.tags[0]).then(data => createProductSlider(data, '.container-for-card-slider', 'similar products'))  
    })
    .catch(err => { //using catch to catch error if any
        location.replace('/404');
    })
}

let productId = null;//declaring product id variable and setting it to null
if(location.pathname != '/products'){//checking for path name whether its equal to /products 
    productId = decodeURI(location.pathname.split('/').pop()); //storing the id
    fetchProductData(); //calling fetchproductdata function
}

//calling getproducts function and passing data.tag if index 1 
//using then to respond to the function and inside it call createproduct slider

