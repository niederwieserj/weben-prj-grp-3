import { apiGet } from '../modules/api.js';
import { createStarsFromRating } from '../modules/utils.js';

let allProducts = [];
let categoriesMap = {};

// Store URL params once at module level so they survive across async calls
let urlParams = new URLSearchParams(window.location.search);

function applyUrlParamsToUI() {
    // 1. Price Range (exists in HTML already)
    if (urlParams.has('price_max')) {
        const rangeInput = document.getElementById('range4');
        const rangeOutput = document.getElementById('rangeValue');
        if (rangeInput) {
            rangeInput.value = urlParams.get('price_max');
            if (rangeOutput) {
                rangeOutput.textContent = '0 - ' + urlParams.get('price_max') + ' €';
            }
        }
    }

    // 2. Min Rating (exists in HTML already)
    if (urlParams.has('min_rating')) {
        const ratingSelect = document.getElementById('min-rating-select');
        if (ratingSelect) {
            ratingSelect.value = urlParams.get('min_rating');
        }
    }

    // 3. Categories — DO NOT apply here, checkboxes don't exist yet.
    //    Will be applied in loadCategories() after DOM elements are created.

    // 4. Sort By (exists in HTML already)
    if (urlParams.has('sort_by')) {
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = urlParams.get('sort_by');
        }
    }

    // 5. Sort Order (exists in HTML already)
    if (urlParams.has('sort_order')) {
        const sortOrderBtn = document.getElementById('sort-order-btn');
        if (sortOrderBtn) {
            sortOrderBtn.dataset.order = urlParams.get('sort_order');

            const iconUse = sortOrderBtn.querySelector('svg use');
            if (iconUse) {
                iconUse.setAttribute('xlink:href',
                    '/frontend/bootstrap-icons/bootstrap-icons.svg#' +
                    (urlParams.get('sort_order') === 'asc' ? 'sort-up' : 'sort-down')
                );
            }

            const label = document.getElementById('sort-order-label');
            if (label) {
                label.textContent = urlParams.get('sort_order') === 'asc' ? 'Ascending' : 'Descending';
            }
        }
    }
}

/**
 * Apply URL category params to checkboxes. Called AFTER loadCategories()
 * has populated the DOM with .category-filter elements.
 */
function applyUrlCategoryParams() {
    if (urlParams.has('categories')) {
        const categoryIds = urlParams.get('categories').split(',');
        document.querySelectorAll('.category-filter').forEach(cb => {
            cb.checked = categoryIds.includes(cb.value);
        });
    }
}

window.addEventListener('layout-ready', async () => {
    // 1. Apply URL params for static HTML elements (price, rating, sort)
    applyUrlParamsToUI();

    // 2. Load categories FIRST (await so checkboxes exist)
    await loadCategories();

    // 3. NOW apply category URL params — checkboxes exist
    applyUrlCategoryParams();
    updateCategoryBadge();

    // 4. Load products
    await loadProducts();

    // 5. Apply initial filter/sort based on all URL params
    applyFilters();

    // 6. Initialize event listeners
    initFilters();
});

// =========================================================================
// EXISTING FUNCTIONS (keep as-is, but ensure they call updateUrlParams)
// =========================================================================

function updateCategoryBadge() {
    const badge = document.getElementById('category-badge');
    if (!badge) return;
    const checkedCount = document.querySelectorAll('.category-filter:checked').length;
    badge.textContent = checkedCount;
}

async function loadCategories() {
    const data = await apiGet('/backend/controllers/request_handler.php', {}, { action: 'getCategories' });
    const categories = data['categories'];
    
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
        input.checked = true; // Default, will be overridden by URL params

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = 'cat-' + cat.category_id;
        label.textContent = cat.name;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        container.appendChild(wrapper);

        input.addEventListener('change', () => {
            applyFilters();
            updateCategoryBadge();
            updateUrlParams();
        });
    });

    updateCategoryBadge();

    const btnSelectAll = document.getElementById('btn-cat-select-all');
    const btnDeselectAll = document.getElementById('btn-cat-deselect-all');

    if (btnSelectAll) {
        btnSelectAll.addEventListener('click', () => {
            document.querySelectorAll('.category-filter').forEach(cb => cb.checked = true);
            updateCategoryBadge();
            applyFilters();
            updateUrlParams();
        });
    }

    if (btnDeselectAll) {
        btnDeselectAll.addEventListener('click', () => {
            document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
            updateCategoryBadge();
            applyFilters();
            updateUrlParams();
        });
    }
}

async function loadProducts() {
    const response = await fetch('/frontend/components/product-card.html');
    const productCardTemplate = await response.text();

    const parser = new DOMParser();
    const productCardDoc = parser.parseFromString(productCardTemplate, 'text/html');
    const cardTemplate = productCardDoc.querySelector('#template');

    const searchTerm = urlParams.get('product-search');
    const data = await apiGet('/backend/controllers/request_handler.php', {}, { 
        action: 'getProductsWithImages',
        search: searchTerm});
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
        productToInsert.setAttribute('data-name', product['name']);
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

    const prices = allProducts.map(row => parseFloat(row['product']['price']));
    const maxPrice = Math.max(...prices, 0);
    const rangeInput = document.getElementById('range4');
    const rangeOutput = document.getElementById('rangeValue');
    if (rangeInput) {
        rangeInput.max = maxPrice;
        if (!rangeInput.value) rangeInput.value = maxPrice;
    }
    if (rangeOutput) {
        if (!rangeOutput.textContent) {
            rangeOutput.textContent = '0 - ' + maxPrice + ' €';
        }
    }

    updateResultCount();
}

function initFilters() {
    const rangeInput = document.getElementById('range4');
    const rangeOutput = document.getElementById('rangeValue');

    if (rangeInput && rangeOutput) {
        rangeInput.addEventListener('input', function () {
            rangeOutput.textContent = '0 - ' + this.value + ' €';
            applyFilters();
            updateUrlParams();
        });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortProducts(this.value);
            updateUrlParams();
        });
    }

    const ratingSelect = document.getElementById('min-rating-select');
    if (ratingSelect) {
        ratingSelect.addEventListener('change', function () {
            applyFilters();
            updateUrlParams();
        });
    }

        const sortOrderBtn = document.getElementById('sort-order-btn');
    if (sortOrderBtn) {
        sortOrderBtn.addEventListener('click', function () {
            // 1. Determine the NEW order immediately
            const currentOrder = this.dataset.order === 'asc' ? 'asc' : 'desc';
            const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
            
            // 2. Update the dataset FIRST
            this.dataset.order = newOrder;

            // 3. Update UI (Icon and Label) immediately
            const iconUse = this.querySelector('svg use');
            if (iconUse) {
                iconUse.setAttribute('xlink:href',
                    '/frontend/bootstrap-icons/bootstrap-icons.svg#' + 
                    (newOrder === 'asc' ? 'sort-up' : 'sort-down')
                );
            }
            
            const label = document.getElementById('sort-order-label');
            if (label) {
                label.textContent = newOrder === 'asc' ? 'Ascending' : 'Descending';
            }

            // 4. Update URL immediately so subsequent reads get the new value
            updateUrlParams();

            // 5. Now sort
            const currentCriteria = document.getElementById('sort-select')?.value || 'price';
            sortProducts(currentCriteria);
            
            // 6. Ensure filters are applied (optional, but keeps state consistent)
            // applyFilters(); // Only if you need to re-run the full filter logic
        });
    }
}

function updateUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    const rangeInput = document.getElementById('range4');
    if (rangeInput) params.set('price_max', rangeInput.value);

    const ratingSelect = document.getElementById('min-rating-select');
    if (ratingSelect) params.set('min_rating', ratingSelect.value);

    const checkedIds = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
    if (checkedIds.length > 0) {
        params.set('categories', checkedIds.join(','));
    } else {
        params.delete('categories');
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) params.set('sort_by', sortSelect.value);

    const sortOrderBtn = document.getElementById('sort-order-btn');
    if (sortOrderBtn) params.set('sort_order', sortOrderBtn.dataset.order || 'asc');

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.replaceState(null, '', newUrl);
}

function applyFilters() {
    const maxPrice = parseInt(document.getElementById('range4').value);
    const minRating = parseFloat(document.querySelector('#min-rating-select')?.value || 0);

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
        const matchesCategory = checkedCategories.has(category);

        if (matchesPrice && matchesRating && matchesCategory) {
            $card.fadeIn(200);
        } else {
            $card.hide();
        }
    });

    const currentCriteria = document.getElementById('sort-select')?.value || 'price';
    sortProducts(currentCriteria);

    updateResultCount();
}

function sortProducts(criteria) {
    const sortOrderBtn = document.getElementById('sort-order-btn');
    const order = sortOrderBtn?.dataset.order || 'asc';
    const multiplier = order === 'asc' ? 1 : -1;

    const cards = Array.from($('.product-card').get());

    cards.sort((a, b) => {
        const $a = $(a);
        const $b = $(b);

        if (criteria === 'price') {
            return multiplier * (parseFloat($a.attr('data-price')) - parseFloat($b.attr('data-price')));
        } else if (criteria === 'rating') {
            return multiplier * (parseFloat($a.attr('data-rating')) - parseFloat($b.attr('data-rating')));
        } else if (criteria === 'name') {
            const nameA = ($a.attr('data-name') || '').toLowerCase();
            const nameB = ($b.attr('data-name') || '').toLowerCase();
            return multiplier * nameA.localeCompare(nameB);
        } else if (criteria === 'stock') {
            return multiplier * (parseInt($b.attr('data-stock')) - parseInt($a.attr('data-stock')));
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