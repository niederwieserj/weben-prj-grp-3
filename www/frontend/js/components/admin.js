import { apiGet, apiPost } from '../modules/api.js';
import { showSuccess, showError } from '../modules/toast.js';

let categories = [];

window.addEventListener('layout-ready', async () => {
    await checkAdminAccess();
});

async function checkAdminAccess() {
    const result = await apiPost('user', 'getUserState');

    if (!result.response.ok || !result.is_admin) {
        document.getElementById('admin-access-message')?.classList.remove('d-none');
        return;
    }

    document.getElementById('admin-content')?.classList.remove('d-none');

    await loadCategories();
    await loadProductsForAdmin();
    await loadOrdersForAdmin();
    await loadAllUsers();

    initCreateProductForm();
}

async function loadCategories() {
    categories = await apiGet({
        controller: 'product',
        action: 'getCategories'
    });

    const createSelect = document.getElementById('create-category-select');
    if (!createSelect) return;

    createSelect.innerHTML = '';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.name;
        createSelect.appendChild(option);
    });
}

function initCreateProductForm() {
    const form = document.getElementById('create-product-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const result = await apiPost('product', 'createProduct', data);

        if (result.response.ok) {
            showSuccess('Product created.');
            form.reset();
            await loadProductsForAdmin();
        } else {
            showError(result.message || 'Could not create product.');
        }
    });
}

async function loadAllUsers() {
    const users = await apiGet({
        controller: 'user',
        action: 'getAllUsers'
    });

    const usersTable = document.getElementById('users-table');

    users.forEach(user => {
        var row = usersTable.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);

        cell1.innerHTML = user['user_id'];
        cell1.classList.add('font-monospace');
        cell2.innerHTML = user['username'];
        cell3.innerHTML = user['email'];
        cell4.innerHTML = user['first_name'];
        cell5.innerHTML = user['last_name'];

        const btnClass = user['is_active'] === true ? 'btn-outline-success' : 'btn-outline-danger';

        cell6.innerHTML = `
        <button type="button" class="btn ${btnClass} border-0 toggle-active-btn" data-user-id="${user['user_id']}">
            <svg class="bi mb-1" width="8" height="8" fill="currentColor">
                <use xlink:href="/frontend/bootstrap-icons/bootstrap-icons.svg#circle-fill" />
            </svg>
        </button>`;

        const btnElement = cell6.querySelector('button.toggle-active-btn');
            
        if (btnElement) {
            btnElement.addEventListener('click', async () => {
                const userId = btnElement.dataset.userId;


                try {
                    const isActive = btnElement.classList.contains('btn-outline-success');

                    const result = await apiPost('user', 'updateUserDataById', { 'user_id': userId, 'is_active': !isActive});

                    if (result.response.ok) {
                        if (isActive) {
                            btnElement.className = 'btn btn-outline-danger border-0 toggle-active-btn';
                        } else {
                            btnElement.className = 'btn btn-outline-success border-0 toggle-active-btn';
                        }
                    } else {
                        showError('Failed to update status');
                    }
                } catch (error) {
                    showError('Failed to update user status.');
                }
            });
        }
    });
}

async function loadProductsForAdmin() {
    const products = await apiGet({
        controller: 'product',
        action: 'getProductsWithImages'
    });

    const container = document.getElementById('products-admin-list');
    if (!container) return;

    container.innerHTML = '';

    if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = '<p class="text-muted">No products found.</p>';
        return;
    }

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';

    tableWrapper.innerHTML = `
        <table class="table table-dark table-hover align-middle">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th class="admin-table-action"></th>
                </tr>
            </thead>
            <tbody>
                ${products.map(row => renderProductTableRows(row)).join('')}
            </tbody>
        </table>
    `;

    container.appendChild(tableWrapper);

    registerProductEditToggleEvents();
    registerProductEditSubmitEvents();
}

function renderProductTableRows(row) {
    const product = row.product;
    const imageUrl = row.images && row.images.length > 0 ? row.images[0].image_url : '';

    return `
        <tr>
            <td class="font-monospace">${escapeHtml(product.product_id)}</td>
            <td>
                ${imageUrl
                    ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" class="admin-product-image">`
                    : '<span class="text-muted">No image</span>'
                }
            </td>
            <td>${escapeHtml(product.name)}</td>
            <td>${escapeHtml(product.category_name || '')}</td>
            <td class="font-monospace">${escapeHtml(product.price)} €</td>
            <td class="font-monospace">${escapeHtml(product.stock_quantity)}</td>
            <td class="admin-table-action">
                <button class="btn btn-sm btn-outline-primary admin-toggle-product-edit"
                        data-product-id="${escapeHtml(product.product_id)}">
                    <svg class="bi" width="16" height="16" fill="currentColor">
                        <use xlink:href="/frontend/bootstrap-icons/bootstrap-icons.svg#pencil" />
                    </svg>
                </button>
            </td>
        </tr>

        <tr class="d-none admin-edit-row" id="edit-product-${escapeHtml(product.product_id)}">
            <td colspan="7">
                ${renderProductEditForm(product, imageUrl)}
            </td>
        </tr>
    `;
}

function renderProductEditForm(product, imageUrl) {
    return `
        <form class="admin-edit-product-form admin-edit-form">
            <input type="hidden" name="product_id" value="${escapeHtml(product.product_id)}">

            <div class="row g-3">
                <div class="col-md-3">
                    <label class="form-label">Name</label>
                    <input class="form-control" name="name" value="${escapeHtml(product.name)}" required>
                </div>

                <div class="col-md-2">
                    <label class="form-label">Price</label>
                    <input class="form-control" name="price" type="number" step="0.01" min="0.01" value="${escapeHtml(product.price)}" required>
                </div>

                <div class="col-md-2">
                    <label class="form-label">Stock</label>
                    <input class="form-control" name="stock_quantity" type="number" min="0" value="${escapeHtml(product.stock_quantity)}" required>
                </div>

                <div class="col-md-3">
                    <label class="form-label">Category</label>
                    <select class="form-select" name="fk_category_id" required>
                        ${renderCategoryOptions(product.fk_category_id)}
                    </select>
                </div>

                <div class="col-md-2 d-flex align-items-end">
                    <button class="btn btn-primary w-100" type="submit">Save</button>
                </div>

                <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="description" rows="2">${escapeHtml(product.description || '')}</textarea>
                </div>

                <div class="col-12">
                    <label class="form-label">Image URL</label>
                    <input class="form-control" name="image_url" value="${escapeHtml(imageUrl)}">
                </div>
            </div>
        </form>
    `;
}

function registerProductEditToggleEvents() {
    document.querySelectorAll('.admin-toggle-product-edit').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            const editRow = document.getElementById(`edit-product-${productId}`);

            if (!editRow) return;

            editRow.classList.toggle('d-none');
            button.innerHTML = editRow.classList.contains('d-none') ? `<svg class="bi" width="16" height="16" fill="currentColor">
                        <use xlink:href="/frontend/bootstrap-icons/bootstrap-icons.svg#pencil" />
                    </svg>` : 'Close';
        });
    });
}

function registerProductEditSubmitEvents() {
    document.querySelectorAll('.admin-edit-product-form').forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const result = await apiPost('product', 'updateProduct', data);

            if (result.response.ok) {
                showSuccess('Product updated.');
                await loadProductsForAdmin();
            } else {
                showError(result.message || 'Could not update product.');
            }
        });
    });
}

async function loadOrdersForAdmin() {
    const orders = await apiGet({
        controller: 'order',
        action: 'getAllOrders'
    });

    const container = document.getElementById('orders-admin-list');
    if (!container) return;

    container.innerHTML = '';

    if (!Array.isArray(orders) || orders.length === 0) {
        container.innerHTML = '<p class="text-muted">No orders found.</p>';
        return;
    }

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';

    tableWrapper.innerHTML = `
        <table class="table table-dark table-hover align-middle">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th class="admin-table-action"></th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => renderOrderTableRows(order)).join('')}
            </tbody>
        </table>
    `;

    container.appendChild(tableWrapper);

    registerOrderEditToggleEvents();
    registerOrderEditSubmitEvents();
}

function renderOrderTableRows(order) {
    return `
        <tr>
            <td class="font-monospace">${escapeHtml(order.order_id)}</td>
            <td>${escapeHtml(order.username)}</td>
            <td>${escapeHtml(order.email)}</td>
            <td class="font-monospace">${escapeHtml(order.total_amount)} €</td>
            <td>
                <span class="badge text-bg-secondary">
                    ${escapeHtml(order.status)}
                </span>
            </td>
            <td class="font-monospace">${escapeHtml(order.created_at)}</td>
            <td class="admin-table-action">
                <button class="btn btn-sm btn-outline-primary admin-toggle-order-edit"
                        data-order-id="${escapeHtml(order.order_id)}">
                    <svg class="bi" width="16" height="16" fill="currentColor">
                        <use xlink:href="/frontend/bootstrap-icons/bootstrap-icons.svg#pencil" />
                    </svg>
                </button>
            </td>
        </tr>

        <tr class="d-none admin-edit-row" id="edit-order-${escapeHtml(order.order_id)}">
            <td colspan="7">
                ${renderOrderEditForm(order)}
            </td>
        </tr>
    `;
}

function renderOrderEditForm(order) {
    const items = Array.isArray(order.items) ? order.items : [];

    const itemsHtml = items.map(item => `
        <tr>
            <td>${escapeHtml(item.product_name || 'Unknown product')}</td>
            <td>${escapeHtml(item.quantity)}</td>
            <td>${escapeHtml(item.price)} €</td>
        </tr>
    `).join('');

    return `
        <form class="admin-edit-order-form admin-edit-form">
            <input type="hidden" name="order_id" value="${escapeHtml(order.order_id)}">

            <div class="row g-3 mb-3">
                <div class="col-md-3">
                    <label class="form-label">Order ID</label>
                    <input class="form-control" value="${escapeHtml(order.order_id)}" disabled>
                </div>

                <div class="col-md-3">
                    <label class="form-label">User</label>
                    <input class="form-control" value="${escapeHtml(order.username)}" disabled>
                </div>

                <div class="col-md-3">
                    <label class="form-label">Total</label>
                    <input class="form-control" value="${escapeHtml(order.total_amount)} €" disabled>
                </div>

                <div class="col-md-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" name="status" required>
                        ${renderStatusOptions(order.status)}
                    </select>
                </div>
            </div>

            <div class="table-responsive mb-3">
                <table class="table table-dark table-sm align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml || `
                            <tr>
                                <td colspan="3" class="text-muted">No items found.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>

            <div class="d-flex justify-content-end">
                <button class="btn btn-primary" type="submit">Save</button>
            </div>
        </form>
    `;
}

function registerOrderEditToggleEvents() {
    document.querySelectorAll('.admin-toggle-order-edit').forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.dataset.orderId;
            const editRow = document.getElementById(`edit-order-${orderId}`);

            if (!editRow) return;

            editRow.classList.toggle('d-none');
            button.innerHTML = editRow.classList.contains('d-none') ? `<svg class="bi" width="16" height="16" fill="currentColor">
                        <use xlink:href="/frontend/bootstrap-icons/bootstrap-icons.svg#pencil" />
                    </svg>` : 'Close';
        });
    });
}

function registerOrderEditSubmitEvents() {
    document.querySelectorAll('.admin-edit-order-form').forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const result = await apiPost('order', 'updateOrderStatus', data);

            if (result.response.ok) {
                showSuccess('Order updated.');
                await loadOrdersForAdmin();
            } else {
                showError(result.message || 'Could not update order.');
            }
        });
    });
}

function renderCategoryOptions(selectedCategoryId) {
    return categories.map(category => {
        const selected = String(category.category_id) === String(selectedCategoryId) ? 'selected' : '';

        return `
            <option value="${escapeHtml(category.category_id)}" ${selected}>
                ${escapeHtml(category.name)}
            </option>
        `;
    }).join('');
}

function renderStatusOptions(currentStatus) {
    const statuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

    return statuses.map(status => {
        const selected = status === currentStatus ? 'selected' : '';

        return `
            <option value="${escapeHtml(status)}" ${selected}>
                ${escapeHtml(status)}
            </option>
        `;
    }).join('');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}