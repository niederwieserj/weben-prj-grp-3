import { apiGet } from '../modules/api.js';
import { createStarsFromRating } from '../modules/utils.js';

let allProducts = []; // Store products globally for filtering

window.addEventListener('layout-ready', () => {
    loadProducts();
    initFilters();
});

async function loadProducts() {
    const response = await fetch('/frontend/components/product-card.html');
    const productCardTemplate = await response.text();

    const parser = new DOMParser();
    const productCardDoc = parser.parseFromString(productCardTemplate, 'text/html');
    const cardTemplate = productCardDoc.querySelector('#template');

    const data = await apiGet('/backend/controllers/request_handler.php', {}, { action: 'getProductsWithImages' });
    allProducts = data['products']; // Store for filtering

    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = ''; // Clear existing

    data['products'].forEach(row => {
        const productToInsert = cardTemplate.cloneNode(true);
        const product = row['product'];

        // Add data attributes for filtering
        productToInsert.classList.add('product-card');
        productToInsert.setAttribute('data-product-id', product['product_id']);
        productToInsert.setAttribute('data-price', product['price']);
        productToInsert.setAttribute('data-rating', product['avg_rating']);
        productToInsert.setAttribute('data-stock', product['stock_quantity']);
        productToInsert.setAttribute('data-category', product['fk_category_id'] || 'uncategorized');

        // Handle images
        if (row['images'] === undefined || row['images'].length === 0) {
            productToInsert.querySelector('.bd-placeholder-img').style.display = 'block';
        } else {
            const img = productToInsert.querySelector('img');
            if (img) {
                img.src = row['images'][0]['image_url'];
                img.style.display = 'block';
            }
        }

        // Populate content
        productToInsert.querySelector('#product-name').textContent = product['name'];
        productToInsert.querySelector('#product-price').textContent = product['price'] + ' €';

        const stars = createStarsFromRating(product['avg_rating']);
        const ratingContainer = productToInsert.querySelector('#product-rating');
        ratingContainer.innerHTML = ''; // Clear existing
        
        stars.forEach(star => {
            ratingContainer.appendChild(star);
        });

        const ratingNumber = document.createElement('small');
        ratingNumber.classList.add('text-body-secondary', 'ms-1', 'fw-light');
        ratingNumber.textContent = product['avg_rating'];
        ratingContainer.appendChild(ratingNumber);

        productToInsert.querySelector('#product-link').href = '/frontend/sites/product.html?id=' + product['product_id'];
        productGrid.appendChild(productToInsert);
    });
}

function initFilters() {
    // Price range filter
    const rangeInput = document.getElementById('range4');
    const rangeOutput = document.getElementById('rangeValue');

    if (rangeInput && rangeOutput) {
        rangeOutput.textContent = '0 - ' + rangeInput.value + ' €';

        rangeInput.addEventListener('input', function() {
            rangeOutput.textContent = '0 - ' + this.value + ' €';
            applyFilters();
        });
    }

    // Sort by dropdown
    const sortSelect = document.querySelector('#product-catalogue-container select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }

    // Min rating filter (you'll need to add this input to your HTML)
    const ratingSelect = document.querySelector('#min-rating-select');
    if (ratingSelect) {
        ratingSelect.addEventListener('change', function() {
            applyFilters();
        });
    }
}

function applyFilters() {
    const maxPrice = parseInt(document.getElementById('range4').value);
    const minRating = parseFloat(document.querySelector('#min-rating-select')?.value || 0);

    $('.product-card').each(function() {
        const $card = $(this);
        const price = parseFloat($card.attr('data-price'));
        const rating = parseFloat($card.attr('data-rating'));

        const matchesPrice = price <= maxPrice;
        const matchesRating = rating >= minRating;

        if (matchesPrice && matchesRating) {
            $card.fadeIn(200);
        } else {
            $card.hide();
        }
    });

    updateResultCount();
}

function sortProducts(criteria) {
    const cards = Array.from($('.product-card').get());
    
    cards.sort((a, b) => {
        const $a = $(a);
        const $b = $(b);
        
        if (criteria === 'price') {
            return parseFloat($a.attr('data-price')) - parseFloat($b.attr('data-price'));
        } else if (criteria === 'rating') {
            return parseFloat($b.attr('data-rating')) - parseFloat($a.attr('data-rating'));
        }
        return 0;
    });

    const grid = document.getElementById('product-grid');
    cards.forEach(card => grid.appendChild(card));
}

function updateResultCount() {
    const visibleCount = $('.product-card:visible').length;
    const totalCount = $('.product-card').length;
    
    // Add a counter element if it doesn't exist
    let counter = document.getElementById('result-counter');
    if (!counter) {
        counter = document.createElement('p');
        counter.id = 'result-counter';
        counter.className = 'text-body-secondary mt-3';
        document.getElementById('product-grid').parentElement.insertBefore(counter, document.getElementById('product-grid'));
    }
    
    counter.textContent = `${visibleCount} of ${totalCount} products shown`;
}