// importing packages

const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const path = require('path');
const exp = require('constants');
const nodemailder = require('nodemailer');

//firebase admin setup
let serviceAccount = require("./ecommerce-website-89f02-firebase-adminsdk-apttt-b629a25807.json");
const { stat } = require('fs');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

//aws config
const aws= require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

//aws parameters
const region ="eu-central-1";
const bucketName ="ecommerce-website-anastasios";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

aws.config.update({
    region,
    accessKeyId,
    secretAccessKey
})


//init s3
const s3 = new aws.S3();

//generate image upload link
async function generateUrl(){
    let date = new Date();
    let id = parseInt(Math.random() * 10000000000);

    const imageName = `${id}${date.getTime()}.jpg`;

    const params = ({
        Bucket: bucketName,
        Key: imageName,
        Expires: 300, //300 ms
        ContentType: 'image/jpeg'
    })
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    return uploadUrl;
}

// declare static path
let staticPath = path.join(__dirname, "public");

//intializing express.js
const app = express();

//middlewares
app.use(express.static(staticPath));
app.use(express.json());

//routes
//home route
app.get("/", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
})

//signup route
app.get('/signup', (req, res) => {
    res.sendFile(path.join(staticPath, "signup.html"));
})

app.post('/signup', (req, res) => {
    let { name, email, password, number, tac, notification } = req.body;

    // form validations
    if(name.length < 3){
        return res.json({'alert': 'name must be 3 letters long'});
    } else if(!email.length){
        return res.json({'alert': 'enter your email'});
    } else if(password.length < 8){
        return res.json({'alert': 'password should be 8 letters long'});
    } else if(!number.length){
        return res.json({'alert': 'enter your phone number'});
    } else if(!Number(number) || number.length < 10){
        return res.json({'alert': 'invalid number, please enter valid one'});
    } else if(!tac){
        return res.json({'alert': 'you must agree to our terms and conditions'});
    } 

    //store user in db
    db.collection('users').doc(email).get()
    .then(user => {
        if(user.exists){
            return res.json({'alert': 'email already exists'});
        } else{
            // encrypt the password before storing it.
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    req.body.password = hash;
                    db.collection('users').doc(email).set(req.body)
                    .then(data => {
                        res.json({
                            name: req.body.name,
                            email: req.body.email,
                            seller: req.body.seller,
                        })
                    })
                })
            })
        }
    })
})

//login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(staticPath, "login.html"));
})

app.post('/login', (req, res) => {
    let { email, password} = req.body;

    if(!email.length || !password.length){
        return res.json({'alert': 'fill all the inputs'})
    }

    db.collection('users').doc(email).get()
    .then(user => {
        if(!user.exists){ //if email does not exist
            return res.json({'alert': 'log in email does not exist'})
        } else{
            bcrypt.compare(password, user.data().password, (err, result) =>{
                if(result){
                    let data = user.data();
                    return res.json({
                        name: data.name,
                        email:data.email,
                        seller: data.seller,
                    })
                } else{
                    return res.json({'alert': 'password is incorect'});
                }
            })
        }
    })
    
})

//seller route
app.get('/seller', (req,res) =>{
    res.sendFile(path.join(staticPath, "seller.html"));
})

app.post('/seller', (req, res) => {
    let { name, about, address, number, tac, legit, email } = req.body;
    if(!name.length || !address.length || !about.length || number.length < 10 || !Number(number)){
        return res.json({'alert':'some inforamation(s) is/are invalid'});
    } else if(!tac || !legit){
        return res.json({'alert': 'you must agree to our terms and conditions'})
    } else{
        // update users seller status here.
        db.collection('sellers').doc(email).set(req.body)
        .then(data => {
            db.collection('users').doc(email).update({
                seller: true
            }).then(data => {
                res.json(true);
            })
        })
    }
})

//add product
app.get('/add-product', (req,res) =>{
    res.sendFile(path.join(staticPath, "addProduct.html"));
})

app.get('/add-product/:id', (req,res) =>{ //dynamic placeholder
    res.sendFile(path.join(staticPath, "addProduct.html"));
})

//get the upload link
app.get('/s3url', (req,res) => {
    generateUrl().then(url => res.json(url));
}) 

// add product
app.post('/add-product', (req, res) => {
    let { name, shortDes, des, images, sizes, actualPrice, discount, sellPrice, stock, tags, tac, email, draft, id } = req.body;

    // validation
    if(!draft){
        if(!name.length){
            return res.json({'alert': 'enter product name'});
        } else if(shortDes.length > 100 || shortDes.length < 10){
            return res.json({'alert': 'short description must be between 10 to 100 letters long'});
        } else if(!des.length){
            return res.json({'alert': 'enter detail description about the product'});
        } else if(!images.length){ // image link array
            return res.json({'alert': 'upload atleast one product image'})
        } else if(!sizes.length){ // size array
            return res.json({'alert': 'select at least one size'});
        } else if(!actualPrice.length || !discount.length || !sellPrice.length){
            return res.json({'alert': 'you must add pricings'});
        } else if(stock < 20){
            return res.json({'alert': 'you should have at least 20 items in stock'});
        } else if(!tags.length){
            return res.json({'alert': 'enter few tags to help ranking your product in search'});
        } else if(!tac){
            return res.json({'alert': 'you must agree to our terms and conditions'});
        } 
    }

    // add product
    let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() * 5000)}` : id;
    db.collection('products').doc(docName).set(req.body)
    .then(data => {
        res.json({'product': name});
    })
    .catch(err => {
        return res.json({'alert': 'some error occured. Try again'});
    })
})

//get products
app.post('/get-products', (req, res) => {
    let { email, id, tag } = req.body;

    if(id){
        docRef = db.collection('products').doc(id)
    } else if(tag){
        docRef = db.collection('products').where('tags', 'array-contains', tag) //using array contain to check if tag array contains this tag or not
    } else{
        docRef = db.collection('products').where('email', '==', email)
    }

    docRef.get() //using get to fetch the documents
    .then(products => { //using then block to respond the data
        if(products.empty){//checking if we got any file empty
            return res.json('no products'); //if so return no products in response
        } 
        let productArr = []; //otherwise make an array
        if(id){
            return res.json(products.data());
        } else {
            products.forEach(item => { //looping for each document
                let data = item.data(); //store all doc in the array
                data.id = item.id; //store documnt id also
                productArr.push(data); //then pushing it to the product array
            }) 
            res.json(productArr) //at last sending the array in response
        }     
    })
})

app.post('/delete-product', (req, res) => {
    let { id } = req.body;
    
    db.collection('products').doc(id).delete()
    .then(data => {
        res.json('success');
    }).catch(err => {
        res.json('err');
    })
})

// product page
app.get('/products/:id', (req, res) => {
    res.sendFile(path.join(staticPath, "product.html"));
})

app.get('/home', (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
})

//search route
app.get('/search/:key', (req, res) => {
    res.sendFile(path.join(staticPath, "search.html"));
})

//cart route
app.get('/cart', (req, res) => {
    res.sendFile(path.join(staticPath, "cart.html"));
})

app.get('/contact', (req, res) => {
    res.sendFile(path.join(staticPath, "contact.html"));
})

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(staticPath, "checkout.html"));
})

app.post('/order', (req,res) =>{
    const { order, email, add } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })

    const mailOption = {
        from:'valid sender email id',
        to: email,
        subject: 'Vitamin Shop - Order Placed',
        html:`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>

            <style>
                body{
                    min-height: 90vh;
                    background: #f5f5f5;
                    font-family: sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .heading{
                    text-align: center;
                    font-size: 40px;
                    width: 50%;
                    display: block;
                    line-height: 50px;
                    margin: 30px auto 60px;
                    text-transform: capitalize;
                }
                .heading span{
                    font-weight: 300;
                }
                .btn{
                    width: 200px;
                    height: 50px;
                    border-radius: 5px;
                    background: #3f3f3f;
                    color: #fff;
                    display: block;
                    margin: auto;
                    font-size: 18px;
                    text-transform: capitalize;
                }
            </style>

        </head>
        <body>
            
            <div>
                <h1 class="heading">dear ${email.split('@')[0]}, <span>your order is successfully placed</span></h1>
                <button class="btn">check status</button>
            </div>

        </body>
        </html>
        `
    }

    let docName = email + Math.floor(Math.random() * 123719287419824);
    db.collection('order').doc(docName).set(req.body)
    .then(data => {

        transporter.sendMail(mailOption, (err, info) =>{
            if (err){
                res.json({'alert': 'oops! it seems like some err occured. Try again'})
            } else {
                res.json({'alert': 'your order is plaved'});
            }
        })

    })
})

// 404 route
app.get('/404', (req, res) => {
    res.sendFile(path.join(staticPath, "404.html"));
})

app.use((req, res) => {
    res.redirect('/404');
})

app.listen(3000, () => {
    console.log('listening on port 3000.......');
})