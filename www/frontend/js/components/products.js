import { apiGet } from '../modules/api.js';
import { createStarsFromRating } from '../modules/utils.js';

let allProducts = [];
let categoriesMap = {}; // category_id -> name lookup

window.addEventListener('layout-ready', () => {
    loadCategories();
    loadProducts();
    initFilters();
});

async function loadCategories() {
    const data = await apiGet('/backend/controllers/request_handler.php', {}, { action: 'getCategories' });
    const categories = data['categories'];
    console.log(categories);

    const container = document.getElementById('category-filters');
    if (!container || !Array.isArray(categories)) return;

    container.innerHTML = '';

    categories.forEach(cat => {
        categoriesMap[cat.category_id] = cat.name;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-check';

        const input = document.createElement('input');
        input.className = 'form-check-input category-filter';
        input.type = 'checkbox';
        input.value = cat.category_id;
        input.id = 'cat-' + cat.category_id;

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = 'cat-' + cat.category_id;
        label.textContent = cat.name;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        container.appendChild(wrapper);

        // Re-filter when any category checkbox changes
        input.addEventListener('change', applyFilters);
    });
}

async function loadProducts() {
    const response = await fetch('/frontend/components/product-card.html');
    const productCardTemplate = await response.text();

    const parser = new DOMParser();
    const productCardDoc = parser.parseFromString(productCardTemplate, 'text/html');
    const cardTemplate = productCardDoc.querySelector('#template');

    const data = await apiGet('/backend/controllers/request_handler.php', {}, { action: 'getProductsWithImages' });
    allProducts = data['products'];

    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';

    data['products'].forEach(row => {
        const productToInsert = cardTemplate.cloneNode(true);
        const product = row['product'];

        productToInsert.classList.add('product-card');
        productToInsert.setAttribute('data-product-id', product['product_id']);
        productToInsert.setAttribute('data-price', product['price']);
        productToInsert.setAttribute('data-rating', product['avg_rating']);
        productToInsert.setAttribute('data-stock', product['stock_quantity']);
        productToInsert.setAttribute('data-category', product['fk_category_id'] || 'uncategorized');

        if (row['images'] === undefined || row['images'].length === 0) {
            productToInsert.querySelector('.bd-placeholder-img').style.display = 'block';
        } else {
            const img = productToInsert.querySelector('img');
            if (img) {
                img.src = row['images'][0]['image_url'];
                img.style.display = 'block';
            }
        }

        productToInsert.querySelector('#product-name').textContent = product['name'];
        productToInsert.querySelector('#product-price').textContent = product['price'] + ' €';

        const stars = createStarsFromRating(product['avg_rating']);
        const ratingContainer = productToInsert.querySelector('#product-rating');
        ratingContainer.innerHTML = '';

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

    updateResultCount();
}

function initFilters() {
    const rangeInput = document.getElementById('range4');
    const rangeOutput = document.getElementById('rangeValue');

    if (rangeInput && rangeOutput) {
        rangeOutput.textContent = '0 - ' + rangeInput.value + ' €';

        rangeInput.addEventListener('input', function () {
            rangeOutput.textContent = '0 - ' + this.value + ' €';
            applyFilters();
        });
    }

    const sortSelect = document.querySelector('#product-catalogue-container select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortProducts(this.value);
        });
    }

    const ratingSelect = document.querySelector('#min-rating-select');
    if (ratingSelect) {
        ratingSelect.addEventListener('change', function () {
            applyFilters();
        });
    }
}

function applyFilters() {
    const maxPrice = parseInt(document.getElementById('range4').value);
    const minRating = parseFloat(document.querySelector('#min-rating-select')?.value || 0);

    // Gather checked category IDs; empty set = no category filter (show all)
    const checkedCategories = new Set();
    document.querySelectorAll('.category-filter:checked').forEach(cb => {
        checkedCategories.add(cb.value);
    });

    $('.product-card').each(function () {
        const $card = $(this);
        const price = parseFloat($card.attr('data-price'));
        const rating = parseFloat($card.attr('data-rating'));
        const category = $card.attr('data-category');

        const matchesPrice = price <= maxPrice;
        const matchesRating = rating >= minRating;
        const matchesCategory = checkedCategories.size === 0 || checkedCategories.has(category);

        if (matchesPrice && matchesRating && matchesCategory) {
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

    let counter = document.getElementById('result-counter');
    if (!counter) {
        counter = document.createElement('p');
        counter.id = 'result-counter';
        counter.className = 'text-body-secondary mt-3';
        const gridParent = document.getElementById('product-grid')?.parentElement;
        if (gridParent) {
            gridParent.insertBefore(counter, document.getElementById('product-grid'));
        }
    }

    counter.textContent = `${visibleCount} of ${totalCount} products shown`;
}