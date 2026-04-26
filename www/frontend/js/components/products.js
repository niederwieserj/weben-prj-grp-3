
import { apiGet } from '../modules/api.js';
import { createStarsFromRating } from '../modules/utils.js';

window.addEventListener('layout-ready', () => {
    loadProducts();

    // This is an example script, please modify as needed
  const rangeInput = document.getElementById('range4');
  const rangeOutput = document.getElementById('rangeValue');

  // Set initial value
  rangeOutput.textContent = '0 - ' + rangeInput.value + ' €';

  rangeInput.addEventListener('input', function() {
    rangeOutput.textContent = '0 - ' + this.value + ' €';
  });
});

async function loadProducts() {
    const response = await fetch('/frontend/components/product-card.html');
    const productCardTemplate = await response.text();

    const parser = new DOMParser();
    const productCardDoc = parser.parseFromString(productCardTemplate, 'text/html');

    const data = await apiGet('/backend/controllers/request_handler.php', {}, { action: 'getProductsWithImages' });

    const productGrid = document.getElementById('product-grid');
    const cardTemplate = productCardDoc.querySelector('#template')

    data['products'].forEach(row => {
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
