import { initBootstrapValidation, resetFormValidation } from '../modules/validators.js';
import { clearCart } from '../modules/cart.js';
import { showError, showSuccess, showWarning } from '../modules/toast.js';
import { getElement } from '../modules/utils.js';
import { apiGet, apiPost } from '../modules/api.js';

async function initCheckout() {

    initBootstrapValidation();

    document.querySelectorAll('.needs-validation').forEach(form => {
        form.addEventListener('input', () => {
            if (form.classList.contains('was-validated')) {
                resetFormValidation(form);
            }
        });
    });

    const result = await apiPost("user", "getUserState");
        
    if (result.response.ok && result.logged_in) {
        loadUserData();
    } else {
        showWarning('Log in to finish checkout.');
    }

    const confirmOrderBtn = getElement('confirmOrderBtn');

    if (confirmOrderBtn) {

        const checkoutForm = confirmOrderBtn.closest('form');

        if (checkoutForm) {
            checkoutForm.removeEventListener('submit', handleCheckoutSubmit);
            checkoutForm.addEventListener('submit', handleCheckoutSubmit);
        }
    }
}

async function loadUserData() {
    var user = null;

    try {
        const result = await apiPost('user', 'getUserData');

        if (result.response.ok && result.user) {
            user = result.user;
            getElement('firstName').value  = user.first_name   ?? '';
            getElement('lastName').value   = user.last_name    ?? '';
            getElement('email').value   = user.email    ?? '';
        } else {
            showError(result.message || 'Could not load profile.');
        }
    } catch (err) {
        showError('Network error — please try again.');
    }

    try {
        const result = await apiGet({ controller: 'user', action: 'getAddressByUserId', user_id: user.user_id });
        
        if (result.response.ok && result.address) {
            const address = result.address;
            getElement('address').value = address.address ?? '';
            getElement('country').value = address.country ?? '';
            getElement('city').value = address.city ?? '';
            getElement('zip').value = address.postal_code ?? '';
        } else {
            showError(result.message || 'Could not load address.');
        }
    } catch (err) {
        showError('Network error — please try again.');
    }
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const confirmOrderBtn = getElement('confirmOrderBtn');

    if (confirmOrderBtn.disabled) return;

    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    // disable order button to prevent double clicking during confirmation process
    confirmOrderBtn.disabled = true;
    const originalText = confirmOrderBtn.innerHTML;
    confirmOrderBtn.innerHTML = 'Processing...';

    try {
        const response = await fetch('/backend/request-handler.php?controller=order&action=createNewOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            await clearCart(); // clear cart if order is successfully completed

            showSuccess('Order confirmed! Order ID: ' + data.order_id);
            setTimeout(() => {window.location.href = `/frontend/sites/profile.html?open_order_id=${data.order_id}`}, 4000);
        } else {
            showError(data.message)

            confirmOrderBtn.disabled = false;
            confirmOrderBtn.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('A network error occurred. Please try again.');
        confirmOrderBtn.disabled = false;
        confirmOrderBtn.innerHTML = originalText;
    }
}

window.addEventListener('layout-ready', () => {
    initCheckout();
});
