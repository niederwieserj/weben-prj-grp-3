
import { apiGet } from '../modules/api.js';
import { createStarsFromRating } from '../modules/utils.js';

async function loadProducts() {
    const response = await fetch('/frontend/components/product-card.html');
    const productCardTemplate = await response.text();

    // Parse the HTML string into a DOM element
    const parser = new DOMParser();
    const productCardDoc = parser.parseFromString(productCardTemplate, 'text/html');

    // console.log(productCardDoc);

    const data = await apiGet('/backend/controllers/request_handler.php', {}, { action: 'getProductsWithImages' });
    // console.log(data);

    const productGrid = document.getElementById('product-grid');
    const cardTemplate = productCardDoc.querySelector('#template')

    data['products'].forEach(row => {
        // console.log(product);

        const productToInsert = cardTemplate.cloneNode(true);

        if (row['images'] === undefined || row['images'].length == 0) {
            productToInsert.querySelector('.bd-placeholder-img').style.display = 'block';
        } else {
            productToInsert.querySelector('img').src = row['images'][0]['image_url'];
            productToInsert.querySelector('img').style.display = 'block';
        }
        
        productToInsert.querySelector('#product-name').textContent = row['product']['name'];
        productToInsert.querySelector('#product-price').textContent = row['product']['price'] + ' €';

        const stars = createStarsFromRating(row['product']['avg_rating']);

        stars.forEach(star => {
            productToInsert.querySelector('#product-rating').appendChild(star);
        });

        const ratingNumber = document.createElement('small');
        ratingNumber.classList.add('text-body-secondary');
        ratingNumber.classList.add('ms-1');
        ratingNumber.classList.add('fw-light');
        ratingNumber.innerHTML = row['product']['avg_rating'];
        productToInsert.querySelector('#product-rating').appendChild(ratingNumber);

        productToInsert.querySelector('#product-link').href = '/frontend/sites/product.html?id=' + row['product']['product_id'];
        console.log(productToInsert.querySelector('#product-link'));

        productGrid.appendChild(productToInsert);
    });
}

window.addEventListener('layout-ready', () => {
    loadProducts();
});