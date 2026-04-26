
import { apiGet } from '../modules/api.js';
import { createStarsFromRating } from '../modules/utils.js';
import { showError } from '../modules/toast.js';

async function loadProduct() {
    const url_string = window.location.href;
    const url = new URL(url_string);
    const id = url.searchParams.get("id");
    console.log(id);

    const response = await apiGet('/backend/controllers/request_handler.php', {}, { action: 'getProduct', product_id: id });

    if(response['success'] === false) {
        document.getElementById('content').style.display = 'none';
        document.querySelector('head title').innerHTML = 'Not found &#x2022; CoreGear';
        showError('Product not found.')
    }

    const product = response['product'];
    document.querySelector('head title').innerHTML = product['name'] + ' &#x2022; CoreGear';

    /*if (row['images'] === undefined || row['images'].length == 0) {
        productToInsert.querySelector('.bd-placeholder-img').style.display = 'block';
    } else {
        productToInsert.querySelector('img').src = row['images'][0]['image_url'];
        productToInsert.querySelector('img').style.display = 'block';
    }*/

    document.querySelector('#product-name').textContent = product['name'];
    document.querySelector('#product-price').textContent = product['price'] + ' €';

    const stars = createStarsFromRating(product['avg_rating']);

    stars.forEach(star => {
        document.querySelector('#product-rating').appendChild(star);
    });

    const ratingNumber = document.createElement('small');
    ratingNumber.classList.add('text-body-secondary');
    ratingNumber.classList.add('ms-1');
    ratingNumber.classList.add('fw-light');
    ratingNumber.innerHTML = product['avg_rating'];
    document.querySelector('#product-rating').appendChild(ratingNumber);

    document.querySelector('#product-description').innerHTML = product['description'];
}

window.addEventListener('layout-ready', () => {
    loadProduct();
});