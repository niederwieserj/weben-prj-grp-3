import { apiGet } from '../modules/api.js';
import { createStarsFromRating } from '../modules/utils.js';

let allProducts = [];
let categoriesMap = {}; // category_id -> name lookup

window.addEventListener('layout-ready', () => {
    loadCategories();
    loadProducts();
    
    // 1. Sync UI with URL, and add missing params to URL
    syncUrlWithCurrentState();
    
    // 2. Initialize event listeners
    initFilters();
});

/**
 * Reads URL parameters. If a parameter is missing, it takes the current 
 * UI value and adds it to the URL. This ensures the URL always matches the state.
 */
function syncUrlWithCurrentState() {
    const params = new URLSearchParams(window.location.search);
    const currentPath = window.location.pathname;
    let hasChanges = false;

    // 1. Price Range
    if (!params.has('price_max')) {
        const rangeInput = document.getElementById('range4');
        if (rangeInput) {
            params.set('price_max', rangeInput.value);
            hasChanges = true;
        }
    }

    // 2. Min Rating
    if (!params.has('min_rating')) {
        const ratingSelect = document.getElementById('min-rating-select');
        if (ratingSelect) {
            params.set('min_rating', ratingSelect.value);
            hasChanges = true;
        }
    }

    // 3. Categories (Comma-separated)
    if (!params.has('categories')) {
        const checkedIds = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
        if (checkedIds.length > 0) {
            params.set('categories', checkedIds.join(','));
            hasChanges = true;
        }
    }

    // 4. Sort By
    if (!params.has('sort_by')) {
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            params.set('sort_by', sortSelect.value);
            hasChanges = true;
        }
    }

    // 5. Sort Order
    if (!params.has('sort_order')) {
        const sortOrderBtn = document.getElementById('sort-order-btn');
        if (sortOrderBtn) {
            const order = sortOrderBtn.dataset.order || 'asc';
            params.set('sort_order', order);
            hasChanges = true;
        }
    }

    // Update URL if we added missing parameters
    if (hasChanges) {
        const newUrl = `${currentPath}?${params.toString()}`;
        // Replace state without reloading the page
        history.replaceState(null, '', newUrl);
    }

    // Now apply the filters based on the (now complete) URL/UI state
    applyFilters();
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
        // Default checked if no URL param overrides it later
        input.checked = true; 

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
            updateUrlParams(); // Update URL on interaction
        });
    });

    updateCategoryBadge();

    // Setup Select All / Deselect All buttons
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

    // Set max price based on most expensive product
    const prices = allProducts.map(row => parseFloat(row['product']['price']));
    const maxPrice = Math.max(...prices, 0);
    const rangeInput = document.getElementById('range4');
    const rangeOutput = document.getElementById('rangeValue');
    if (rangeInput) {
        rangeInput.max = maxPrice;
        // If URL didn't set it, default to max
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
            updateUrlParams(); // Update URL on interaction
        });
    }

    // Sort criteria dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortProducts(this.value);
            updateUrlParams(); // Update URL on interaction
        });
    }

    const ratingSelect = document.getElementById('min-rating-select');
    if (ratingSelect) {
        ratingSelect.addEventListener('change', function () {
            applyFilters();
            updateUrlParams(); // Update URL on interaction
        });
    }

    // Sort order toggle button
    const sortOrderBtn = document.getElementById('sort-order-btn');
    if (sortOrderBtn) {
        sortOrderBtn.addEventListener('click', function () {
            const isAsc = this.dataset.order === 'asc';
            const newOrder = isAsc ? 'desc' : 'asc';
            this.dataset.order = newOrder;

            // Swap icon
            const iconUse = this.querySelector('svg use');
            if(iconUse) {
                iconUse.setAttribute('xlink:href',
                    '/frontend/bootstrap-icons/bootstrap-icons.svg#' + (newOrder === 'asc' ? 'sort-up' : 'sort-down')
                );
            }

            // Swap label
            const label = document.getElementById('sort-order-label');
            if(label) {
                label.textContent = newOrder === 'asc' ? 'Ascending' : 'Descending';
            }

            // Re-sort with current criteria and new direction
            const currentCriteria = document.getElementById('sort-select')?.value || 'price';
            sortProducts(currentCriteria);
            updateUrlParams(); // Update URL on interaction
        });
    }
}

/**
 * Helper to update URL parameters based on current UI state without reloading.
 * Called whenever a filter changes.
 */
function updateUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    // Price
    const rangeInput = document.getElementById('range4');
    if (rangeInput) params.set('price_max', rangeInput.value);

    // Rating
    const ratingSelect = document.getElementById('min-rating-select');
    if (ratingSelect) params.set('min_rating', ratingSelect.value);

    // Categories
    const checkedIds = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
    if (checkedIds.length > 0) {
        params.set('categories', checkedIds.join(','));
    } else {
        params.delete('categories');
    }

    // Sort By
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) params.set('sort_by', sortSelect.value);

    // Sort Order
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
        // Show none if no categories selected, otherwise check if category matches
        const matchesCategory = checkedCategories.has(category);

        if (matchesPrice && matchesRating && matchesCategory) {
            $card.fadeIn(200);
        } else {
            $card.hide();
        }
    });

    // Re-sort after filtering
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
            return multiplier * (parseInt($a.attr('data-stock')) - parseInt($b.attr('data-stock')));
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

function updateCategoryBadge() {
    const badge = document.getElementById('category-badge');
    if (!badge) return;
    const checkedCount = document.querySelectorAll('.category-filter:checked').length;
    badge.textContent = checkedCount;
}
