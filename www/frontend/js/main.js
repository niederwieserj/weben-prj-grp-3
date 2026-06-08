/**
 * main.js — Application logic entry point.
 * 
 * Waits for 'layout-ready' to ensure:
 * 1. Layout components (navbar/footer) are injected.
 * 2. Bootstrap JS is loaded.
 * 3. User state is fetched.
 */

import { initAuth } from './components/auth.js';
import { initResetPassword } from './components/reset-password.js';
import { initSignUp } from './components/sign-up.js';
import { initCart } from './components/cart.js';


/**
 * Initialize all application components.
 */
function bootstrapApp() {
    console.log('App: Initializing components...');

    initAuth();
    initCart();
    initResetPassword();
    initSignUp();
    
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
