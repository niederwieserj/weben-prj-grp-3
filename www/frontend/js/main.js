/**
 * main.js — Application logic entry point.
 * 
 * Waits for 'layout-ready' to ensure:
 * 1. Layout components (navbar/footer) are injected.
 * 2. Bootstrap JS is loaded.
 * 3. User state is fetched.
 */

import { initAuth } from './components/auth.js';
import { initCheckout } from './components/checkout.js';
import { initResetPassword } from './components/reset-password.js';
import { initSignUp } from './components/sign-up.js';
import { initCart } from './components/cart.js';
// import { initProducts } from './components/products.js'; // Future

/**
 * Initialize all application components.
 */
function bootstrapApp() {
    console.log('App: Initializing components...');
    
    // Initialize Validation (Safe to run multiple times due to guards in validators.js)
    // We import the function but don't call it here yet, 
    // because we need to ensure the DOM elements exist first.
    // Actually, initBootstrapValidation() in validators.js is safe to call anytime.
    // But let's keep it inside the components for clarity.

    initAuth();
    initCheckout();
    initResetPassword();
    initSignUp();
    initCart();
    // initProducts();
    
    console.log('App: Ready.');
}

// Wait for layout.js to finish its job
window.addEventListener('layout-ready', () => {
    bootstrapApp();
});

// Fallback: If layout.js fails or is missing, try to init after a short delay
// (Defensive coding for development environments)
setTimeout(() => {
    if (!window.layoutReadyFired) {
        console.warn('App: layout-ready event not received. Attempting fallback init.');
        bootstrapApp();
    }
}, 2000);
