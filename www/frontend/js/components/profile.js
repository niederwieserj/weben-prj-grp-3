/**
 * components/profile.js
 * Fetches, populates, and saves user profile data.
 * Uses the centralised api.js helper and existing backend actions.
 */

import { apiGet, apiPost } from '../modules/api.js';
import { showToast, showSuccess, showError } from '../modules/toast.js';
import { getElement } from '../modules/utils.js';

const FORM_ID      = 'profile-form';
const ALERT_ID     = 'profile-alert';
const BTN_SAVE_ID  = 'btn-save';
const BTN_DEL_ID   = 'btn-delete-account';

const FIELD_IDS = ['title', 'username', 'first_name', 'last_name', 'email'];
let userOrders = [];

/* ── Helpers ─────────────────────────────────────────────── */

function setFormDisabled(disabled) {
    const inputs = getElement(FORM_ID).querySelectorAll('input, select, button');
    inputs.forEach(el => { el.disabled = disabled; });
}

/* ── Load ────────────────────────────────────────────────── */

async function loadProfile() {
    try {
        const res = await apiPost('user', 'getUserData');

        console.info(res);

        if (res.response.ok && res.user) {
            const u = res.user;
            getElement('title').value       = u.title       ?? '';
            getElement('username').value    = u.username     ?? '';
            getElement('first_name').value  = u.first_name   ?? '';
            getElement('last_name').value   = u.last_name    ?? '';
            getElement('email').value       = u.email        ?? '';
        } else {
            showError(res.message || 'Could not load profile.');
        }
    } catch (err) {
        showError('Network error — please try again.');
    }
}

// ******************** load history of user orders **********************

async function loadUserOrders(){
    try {
        const res = await apiGet('/backend/request-handler.php', {}, {
            controller: 'order',
            action: 'getOrdersByUserId'
        });

        const container = document.getElementById('order-history-container'); 
        if (!container) return;

        if (!res || !Array.isArray(res) || res.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-3">No orders found.</p>';
            return;
        }

        
        userOrders = res;

        // order history list
        container.innerHTML = res.map(order => `
            <a href="#" class="list-group-item list-group-item-action px-3 border-1 rounded-2 mb-2" 
               data-bs-toggle="modal" data-bs-target="#invoiceModal" 
               onclick="viewOrderDetails(${order.order_id}); return false;">

                <div class="d-flex w-100 justify-content-between">
                    <h5 class="order-number mb-1">Your order #CG-${order.order_id}</h5>
                    <small class="order-date text-muted">${order.created_at}</small>
                </div>
                
                <div class="d-flex w-100 justify-content-between mt-2">
                    <p class="order-number mb-1 text-light">Total amount: <span class="text-warning fw-bold">${parseFloat(order.total_amount).toFixed(2)} €</span></p>
                    <small class="text-primary fw-semibold">click to view details</small>
                </div>
            </a>
        `).join('');

    } catch (err) {
        console.error("Error loading history:", err);
        const container = document.getElementById('order-history-container');
        if (container) {
            container.innerHTML = '<p class="text-danger text-center py-3">Failed to load order data.</p>';
        }
    }
}

// ************************* view invoice details ***************************

function viewOrderDetails(orderId) {
    const order = userOrders.find(o => o.order_id === orderId);
    if (!order) return;

    
    const firstName = getElement('first_name').value;
    const lastName  = getElement('last_name').value;
    const email     = getElement('email').value;

    
    let badgeColor = 'bg-warning text-black';
    if (order.status === 'completed' || order.status === 'paid') {
        badgeColor = 'bg-success text-white';
    } else if (order.status === 'cancelled') {
        badgeColor = 'bg-danger text-white';
    } else if (order.status === 'shipped') {
        badgeColor = 'bg-info text-black';
    }

    
    const itemsHtml = (order.items || []).map((item, index) => {
        const lineTotal = (parseFloat(item.price) * parseInt(item.quantity)).toFixed(2);
        return `
            <tr>
                <th scope="row" class="text-light">${index + 1}</th>
                <td class="text-light">${item.product_name}</td>
                <td class="text-light">${item.quantity}</td>
                <td class="text-light">${parseFloat(item.price).toFixed(2)} €</td>
                <td class="text-light fw-bold">${lineTotal} €</td>
            </tr>
        `;
    }).join('');

    const modalBody = document.getElementById('invoice-modal-body');
    if (!modalBody) return;

   // invoice layout
    modalBody.innerHTML = `
        <div class="card bg-dark text-light border-0">
            <div class="card-body">
                <div class="container mb-4 mt-3">
                    <div class="row d-flex align-items-baseline">
                        <div class="col-xl-9">
                            <p style="color: #7e8d9f; font-size: 20px;">Invoice >> <strong>ID: #CG-${order.order_id}</strong></p>
                        </div>
                        <div class="col-xl-3 text-end">
                            <button class="btn btn-light btn-sm text-capitalize border-0" onclick="window.print()">
                                <i class="fas fa-print text-primary"></i> Print
                            </button>
                        </div>
                        <hr class="border-secondary">
                    </div>

                    <div class="container">
                        <div class="text-center mb-4">
                            <h3 style="color:#60bdf3;">CoreGear Shop</h3>
                            <p class="pt-0 text-muted small">coregear-shop.com</p>
                        </div>

                        <div class="row">
                            <div class="col-xl-8 mb-3">
                                <ul class="list-unstyled">
                                    <li class="text-muted">To: <span style="color:#5d9fc5;" class="fw-bold">${firstName} ${lastName}</span></li>
                                    <li class="text-muted small">Email connection: ${email}</li>
                                </ul>
                            </div>
                            <div class="col-xl-4 mb-3">
                                <p class="text-muted mb-1 small uppercase fw-bold">Invoice Details</p>
                                <ul class="list-unstyled">
                                    <li class="text-muted small"><span class="fw-bold">ID:</span> #CG-${order.order_id}</li>
                                    <li class="text-muted small"><span class="fw-bold">Creation Date: </span>${order.created_at}</li>
                                    <li class="text-muted small"><span class="me-1 fw-bold">Status:</span><span class="badge ${badgeColor} fw-bold">${order.status}</span></li>
                                </ul>
                            </div>
                        </div>

                        <div class="row my-2 justify-content-center">
                            <table class="table table-dark table-striped table-borderless border-secondary align-middle">
                                <thead style="background-color:#84B0CA;" class="text-white">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Qty</th>
                                        <th scope="col">Unit Price</th>
                                        <th scope="col">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="row mt-4">
                            <div class="col-xl-8">
                                <p class="text-muted small italic">Thank you for your purchase with CoreGear!</p>
                            </div>
                            <div class="col-xl-4 text-end">
                                <p class="text-light" style="font-size: 20px;">
                                    <span class="me-3 text-muted small">Total Paid:</span>
                                    <span class="text-success fw-bold">${parseFloat(order.total_amount).toFixed(2)} €</span>
                                </p>
                            </div>
                        </div>
                        <hr class="border-secondary">
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.viewOrderDetails = viewOrderDetails;


/* ── Save ────────────────────────────────────────────────── */

async function saveProfile(event) {
    event.preventDefault();

    const form = getElement(FORM_ID);

    // Bootstrap 5 native validation
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const payload = {
        title:      getElement('title').value,
        first_name: getElement('first_name').value,
        last_name:  getElement('last_name').value,
        email:      getElement('email').value
    };

    setFormDisabled(true);

    try {
        const res = await apiPost('user', 'updateUserData', payload);

        if (res.success) {
            showSuccess('Profile updated successfully.');
            form.classList.remove('was-validated');
        } else {
            showError(res.message || 'Update failed.');
        }
    } catch (err) {
        showError('Network error — please try again.');
    } finally {
        setFormDisabled(false);
    }
}

/* ── Delete Account (placeholder) ────────────────────────── */

function handleDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        // TODO: call apiPost('deleteAccount') when implemented
        showError('Account deletion is not yet implemented.');
    }
}

/* ── Init ────────────────────────────────────────────────── */

window.addEventListener('layout-ready', () => {
    loadProfile();
    loadUserOrders();
    getElement(FORM_ID).addEventListener('submit', saveProfile);
    getElement(BTN_DEL_ID).addEventListener('click', handleDeleteAccount);
});