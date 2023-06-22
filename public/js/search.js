const searchKey = decodeURI(location.pathname.split('/').pop()); //accessing search keyword

const searchSpanElement = document.querySelector('#search-key'); //selecting span element
searchSpanElement.innerHTML = searchKey; 

getProducts(searchKey).then(data => createProductCards(data, '.card-container'));