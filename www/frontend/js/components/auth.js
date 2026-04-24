/**
 * auth.js — Sign-out and password-reset functionality.
 * Depends on: modules/api.js, modules/utils.js, modules/validators.js
 */

import { apiPost } from '../modules/api.js';
import { showAlert, toggleVisibility, getElement } from '../modules/utils.js';
import { initBootstrapValidation } from '../modules/validators.js';

/* ------------------------------------------------------------------ */
/*  Sign-out                                                           */
/* ------------------------------------------------------------------ */

/**
 * Perform sign-out via the backend and swap the nav dropdowns.
 *
 * @param {Event} e — click event
 */
async function signOut(e) {
    e.preventDefault();
    e.stopPropagation();

    try {
        const result = await apiPost('signout');

        if (result.success) {
            toggleVisibility('nav-drop-logged-out', 'nav-drop-logged-in');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/* ------------------------------------------------------------------ */
/*  Password reset                                                     */
/* ------------------------------------------------------------------ */

/**
 * Request a password-reset link for the given email.
 * Reads from #resetEmail, writes feedback to #resetMessage.
 */
async function requestPasswordReset() {
    const emailInput = getElement('resetEmail');
    const messageBox = getElement('resetMessage');

    if (!emailInput || !messageBox) return;

    const email = emailInput.value.trim();

    if (email === '') {
        showAlert(messageBox, 'danger', 'Please enter your email.');
        return;
    }

    try {
        const data = await apiPost('requestPasswordReset', { email });

        if (data.success) {
            showAlert(
                messageBox,
                'success',
                `${data.message}<br><a href="${data.reset_link}">Open reset page</a>`
            );
        } else {
            showAlert(messageBox, 'danger', data.message);
        }
    } catch (error) {
        console.error('Password reset error:', error);
        showAlert(messageBox, 'danger', 'Failed to request password reset.');
    }
}

/* ------------------------------------------------------------------ */
/*  Public initialisation                                               */
/* ------------------------------------------------------------------ */

/**
 * Wire up all auth-related event listeners.
 * Call once from main.js after DOMContentLoaded.
 */
export function initAuth() {
    // Sign-out button (delegated click on document so it works
    // even if the button is injected later)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-sign-out') {
            signOut(e);
        }
    });

    // Expose requestPasswordReset globally so the password-reset
    // modal's onclick="requestPasswordReset()" still works.
    // Long-term: replace the inline onclick with a data-attribute listener.
    window.requestPasswordReset = requestPasswordReset;

    // Enable Bootstrap validation on auth forms
    initBootstrapValidation();
}
