let user = JSON.parse(sessionStorage.user || null); //access user from session storage
let loader = document.querySelector('.loader');  //select loader element

// checking if user is logged in or not
//validate the user on load using token
window.onload = () => {
    if(user){
        if(!compareToken(user.authToken, user.email)){  //comparing auth token
            location.replace('/login');
        }
    } else{
        location.replace('/login'); //if token not valid redirect user to login page
    }
}


//price inputs
const actualPrice = document.querySelector('#actual-price');
const discountPercentage = document.querySelector('#discount');
const sellingPrice = document.querySelector('#sell-price');

discountPercentage.addEventListener('input', () => { //adding input event
    if(discountPercentage.value > 100){ //checking if discount is more than 100 because there cant be free products
        discountPercentage.value = 90; //if its >100 changing it to 90
    } else{
        let discount = actualPrice.value * discountPercentage.value / 100; //calculating discount price
        sellingPrice.value = actualPrice.value - discount; //calculating final price with discount
    }
})

sellingPrice.addEventListener('input', () => {
    let discount = (sellingPrice.value / actualPrice.value) * 100; //calculating discount percentage
    discountPercentage.value = discount; //setting discount percentage value equal to discount
})

// upload image handle
let uploadImages = document.querySelectorAll('.fileupload');
let imagePaths = []; // empty array will store all uploaded images paths which will later be stored to database;

uploadImages.forEach((fileupload, index) => { //looping for each upload
    fileupload.addEventListener('change', () => { //adding change event to file upload or upload input
        const file = fileupload.files[0]; //accessing the uploaded file
        let imageUrl; //defining an imageurl variable to store image url

        if(file.type.includes('image')){ //checking if file.type includes image or not
            // means user uploaded an image
            fetch('/s3url').then(res => res.json()) //making get request to S3url route
            .then(url => {
                fetch(url,{ //making PUT request to the url
                    method: 'PUT',
                    headers: new Headers({'Content-Type': 'multipart/form-data'}), //setting its content type to multipart/form-data
                    body: file //sending file as a body
                }).then(res => { //using then to catch the response 
                    imageUrl = url.split("?")[0]; //storing the url inside imageUrl variable
                    imagePaths[index] = imageUrl; //adding the url inside imagePath array 
                    let label = document.querySelector(`label[for=${fileupload.id}]`); //selecting the label element using query selector method 
                    label.style.backgroundImage = `url(${imageUrl})`; //using style method to give background image 
                    let productImage = document.querySelector('.product-img');//doing the same for productImage element
                    productImage.style.backgroundImage = `url(${imageUrl})`;
                })
            })
        } else{
            showAlert('upload image only');
        }
    })
})

//form submission

const productName = document.querySelector('#product-name');
const shortLine = document.querySelector('#short-des');
const des = document.querySelector('#des');

let sizes = []; // will store all the sizes

const stock = document.querySelector('#stock');
const tags = document.querySelector('#tags');
const tac = document.querySelector('#tac');

// buttons
const addProductBtn = document.querySelector('#add-btn');
const saveDraft = document.querySelector('#save-btn');

//store size function  //this function will store all the checked sizes
const storeSizes = () => {
    sizes = []; // clearing array 
    let sizeCheckBox = document.querySelectorAll('.size-checkbox'); //select all the sizes checkbox
    sizeCheckBox.forEach(item => { //using each to loop through each checkbox
        if(item.checked){ //checking if its checked or not
            sizes.push(item.value);  //if its checked then add its value to the sizes array using array.push method
        }
    })
}

const validateForm = () => {
    if(!productName.value.length){
        return showAlert('enter product name');
    } else if(shortLine.value.length > 100 || shortLine.value.length < 10){
        return showAlert('short description must be between 10 to 100 letters long');
    } else if(!des.value.length){
        return showAlert('enter detail description about the product');
    } else if(!imagePaths.length){ // image link array
        return showAlert('upload atleast one product image')
    } else if(!sizes.length){ // size array
        return showAlert('select at least one size');
    } else if(!actualPrice.value.length || !discount.value.length || !sellingPrice.value.length){
        return showAlert('you must add pricings');
    } else if(stock.value < 20){
        return showAlert('you should have at least 20 items in stock');
    } else if(!tags.value.length){
        return showAlert('enter few tags to help ranking your product in search');
    } else if(!tac.checked){
        return showAlert('you must agree to our terms and conditions');
    } 
    return true;
}

const productData = () => {
    let tagArr = tags.value.split(',');
    tagArr.forEach((item, i) => tagArr[i] = tagArr[i].trim());
    return data = {
        name: productName.value,
        shortDes: shortLine.value,
        des: des.value,
        images: imagePaths,
        sizes: sizes,
        actualPrice: actualPrice.value,
        discount: discountPercentage.value,
        sellPrice: sellingPrice.value,
        stock: stock.value,
        tags: tagArr,
        tac: tac.checked,
        email: user.email
    }
}

addProductBtn.addEventListener('click', () => {
    storeSizes();
    // validate form
    if(validateForm()){ // validateForm return true or false while doing validation
        loader.style.display = 'block';
        let data = productData();
        if(productId){
            data.id = productId;
        }
        sendData('/add-product' ,data);
    }
})

// save draft btn
saveDraft.addEventListener('click', () => {
    // store sizes
    storeSizes();
    // check for product name
    if(!productName.value.length){
        showAlert('enter product name');
    } else{ // don't validate the data
        let data = productData();
        data.draft = true;
        if(productId){
            data.id = productId;
        }
        sendData('/add-product', data);
    }
})

//existing product detail handle

const setFormsData = (data) => {
    //setting all inputs value to the data value
    productName.value = data.name; 
    shortLine.value = data.shortDes;
    des.value = data.des;
    actualPrice.value = data.actualPrice;
    discountPercentage.value = data.discount;
    sellingPrice.value = data.sellPrice;
    stock.value = data.stock;
    tags.value = data.tags;

    // set up images
    imagePaths = data.images; //storing image paths to the array
    imagePaths.forEach((url, i) => {
        let label = document.querySelector(`label[for=${uploadImages[i].id}]`);  //we are selecting particular indexed upload buttons label
        label.style.backgroundImage = `url(${url})`;
        let productImage = document.querySelector('.product-image');
        productImage.style.backgroundImage = `url(${url})`;
    })

    // setup sizes
    sizes = data.sizes;

    let sizeCheckbox = document.querySelectorAll('.size-checkbox');
    sizeCheckbox.forEach(item => {
        if(sizes.includes(item.value)){
            item.setAttribute('checked', '');
        }
    })
}

const fetchProductData = () => {
    fetch('/get-products', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({email: user.email, id: productId})
    })
    .then((res) => res.json())
    .then(data => {
        setFormsData(data);
    })
    .catch(err => {
        console.log(err);
    })
}

let productId = null;
if(location.pathname != '/add-product'){
    productId = decodeURI(location.pathname.split('/').pop());

    fetchProductData();
}
