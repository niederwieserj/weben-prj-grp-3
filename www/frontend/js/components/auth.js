/**
 * auth.js — Authentication component (login, logout, password reset).
 * Depends on: modules/api.js, modules/toast.js, modules/validators.js
 */

import { apiPost } from '../modules/api.js';
import { showToast, showSuccess, showError } from '../modules/toast.js';
import { showAlert, toggleVisibility, getElement } from '../modules/utils.js';
import { initBootstrapValidation } from '../modules/validators.js';

/* ------------------------------------------------------------------ */
/*  Login                                                              */
/* ------------------------------------------------------------------ */

/**
 * Handle login form submission.
 *
 * @param {Event} e - Submit event
 */
async function handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Add action for backend routing
    data.action = 'login';
    data['remember-me'] = document.getElementById('remember-me')?.checked || false;

    // console.log('Login data:', data);

    try {
        const result = await apiPost('user', 'login', data);

        console.log(result);

        if (result.response.ok) {
            // Update navigation dropdowns
            toggleVisibility('nav-drop-logged-in', 'nav-drop-logged-out');

            // Show success toast
            showSuccess('Login successful! Redirecting...');

            // Redirect to home page
            setTimeout(() => {
                window.location.replace('home.html');
            }, 500);
        } else {
            // Show error toast
            showError(result.message || 'Invalid username or password.');

            // Also update logo text (from your original code)
            const logo = getElement('logo');
            if (logo) {
                logo.innerText = result.message;
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Failed to connect to server. Please try again.');
    }
}

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
        const result = await apiPost('user', 'signout');

        if (result.success) {
            toggleVisibility('nav-drop-logged-out', 'nav-drop-logged-in');
            showSuccess('You have been logged out.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showError('Failed to log out.');
    }
}

/* ------------------------------------------------------------------ */
/*  Password reset                                                     */
/* ------------------------------------------------------------------ */

/**
 * Request a password-reset link for the given email.
 * Reads from #resetEmail, writes feedback to #resetMessage.
 */
async function handlePasswordResetRequest(e) {
    e.preventDefault();
    e.stopPropagation();

    const emailInput = getElement('resetEmail');
    const messageBox = getElement('resetMessage');

    if (!emailInput || !messageBox) return;

    const email = emailInput.value.trim();

    if (email === '') {
        showError('Please enter your email.');
        return;
    }

    try {
        const data = await apiPost('user', 'requestPasswordReset', { email });

        if (data.success) {
            showAlert(messageBox, 'success',
                `${data.message}<br><a href="${data.reset_link}">Open reset page</a>`);
            showSuccess('Password reset link sent!');
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Password reset error:', error);
        showError('Failed to request password reset.');
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
    // Login form submission
    const loginForm = getElement('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Sign-out button (delegated click on document)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-sign-out') {
            signOut(e);
        }
    });

    // Password reset request form (replaces onclick="requestPasswordReset()")
    const resetForm = getElement('resetPasswordRequestForm');
    if (resetForm) {
        resetForm.addEventListener('submit', handlePasswordResetRequest);
    }

    // Enable Bootstrap validation on auth forms
    initBootstrapValidation();
}
