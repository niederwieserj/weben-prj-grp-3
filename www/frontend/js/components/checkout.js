/**
 * checkout.js — Checkout form behaviour.
 * Depends on: modules/validators.js
 */

import { initBootstrapValidation, resetFormValidation } from '../modules/validators.js';
import { clearCart } from '../modules/cart.js';
import { showError, showSuccess } from '../modules/toast.js';
import { getElement } from '../modules/utils.js';


export function initCheckout() {

    initBootstrapValidation();

    document.querySelectorAll('.needs-validation').forEach(form => {
        form.addEventListener('input', () => {
            if (form.classList.contains('was-validated')) {
                resetFormValidation(form);
            }
        });
    });

    const confirmOrderBtn = getElement('confirmOrderBtn');

    if (confirmOrderBtn) {
        
        const checkoutForm = confirmOrderBtn.closest('form');
        
        if (checkoutForm) {
            
            checkoutForm.removeEventListener('submit', handleCheckoutSubmit);
            checkoutForm.addEventListener('submit', handleCheckoutSubmit);
        }
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

        if (data.success) {
            
            await clearCart(); // clear cart if order is successfully completed
            
            alert('Order confirmed! Order ID: ' + data.order_id);
            window.location.href = '/frontend/sites/order-invoice.html'; 
        } else {
            alert('Error: ' + data.message);
            
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

