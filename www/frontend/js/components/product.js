
import { apiGet } from '../modules/api.js';
import { createStarsFromRating } from '../modules/utils.js';
import { showError } from '../modules/toast.js';

async function loadProduct() {
    const url_string = window.location.href;
    const url = new URL(url_string);
    const id = url.searchParams.get("id");

    const response = await apiGet('/backend/controllers/request_handler.php', {}, { action: 'getProductWithImages', product_id: id });
    // console.log(response);

    if (response['success'] === false) {
        document.getElementById('content').style.display = 'none';
        document.querySelector('head title').innerHTML = 'Not found &#x2022; CoreGear';
        showError('Product not found.')
        return;
    }

    const product = response['products']['product'];
    document.querySelector('head title').innerHTML = product['name'] + ' &#x2022; CoreGear';

    const images = response['products']['images'];

    console.log(images);

    if (images === undefined || images.length == 0) {
        console.log('empty');
    } else {
        const carouselInner = document.querySelector('.carousel-inner');

        // Clear any existing placeholder items
        carouselInner.innerHTML = '';

        // Build carousel items
        images.forEach((image, index) => {

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('carousel-item');
            if (index === 0) {
                itemDiv.classList.add('active');
            }
            itemDiv.style.height = '400px';

            const img = document.createElement('img');
            img.id = `product-image-${index + 1}`;
            img.classList.add('p-5');
            img.src = image.image_url;
            img.alt = image.alt_text || '';

            itemDiv.appendChild(img);
            carouselInner.appendChild(itemDiv);
        });
    }

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

    const cartActions = document.getElementById('product-cart-actions');

    if (cartActions) {
        cartActions.setAttribute('data-product-id', product['product_id']);
        cartActions.setAttribute('data-product-name', product['name']);
        cartActions.setAttribute('data-product-price', product['price']);

        if (images !== undefined && images.length > 0) {
            cartActions.setAttribute('data-product-image', images[0]['image_url']);
        } else {
            cartActions.setAttribute('data-product-image', '');
        }
    }
}

window.addEventListener('layout-ready', () => {
    loadProduct();
});