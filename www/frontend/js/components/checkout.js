/**
 * checkout.js — Checkout form behaviour.
 * Depends on: modules/validators.js
 */

import { initBootstrapValidation, resetFormValidation } from '../modules/validators.js';

/**
 * Initialise checkout-specific listeners.
 * Call once from main.js after DOMContentLoaded.
 */
export function initCheckout() {
    // Bootstrap validation on all checkout forms
    initBootstrapValidation();

    // Optional: clear validation state when the user starts editing
    // a previously-submitted form (improves UX on the dark/neon theme
    // where red invalid borders can look harsh).
    document.querySelectorAll('.needs-validation').forEach(form => {
        form.addEventListener('input', () => {
            if (form.classList.contains('was-validated')) {
                resetFormValidation(form);
            }
        });
    });

    const confirmOrder = getElement('confirmOrderBtn');
}



