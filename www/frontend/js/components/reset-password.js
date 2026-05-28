/**
 * reset-password.js — Password reset form handler.
 * Depends on: modules/api.js, modules/toast.js, modules/validators.js
 */

import { apiPost } from '../modules/api.js';
import { showError, showSuccess } from '../modules/toast.js';
import { getElement } from '../modules/utils.js';
import { initBootstrapValidation } from '../modules/validators.js';

/**
 * Handle the password reset form submission.
 *
 * @param {Event} e - Submit event
 */
async function handleResetPassword(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const newPasswordInput = getElement('newPassword');
    const messageBox = getElement('message');

    if (!newPasswordInput || !messageBox) return;

    const newPassword = newPasswordInput.value.trim();

    if (!token) {
        messageBox.innerHTML = '<div class="alert alert-danger">Missing reset token.</div>';
        showError('Missing reset token.');
        return;
    }

    if (newPassword === '') {
        messageBox.innerHTML = '<div class="alert alert-danger">Please enter a new password.</div>';
        showError('Please enter a new password.');
        return;
    }

    try {
        const data = await apiPost('user', 'resetPassword', { token, newPassword });

        if (data.response.ok) {
            messageBox.innerHTML = `
                <div class="alert alert-success">
                    Password reset successful.<br>
                    <a href="/frontend/sites/sign-in.html">Back to sign in</a>
                </div>
            `;
            showSuccess('Password has been reset successfully.');
        } else {
            messageBox.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            showError(data.message);
        }
    } catch (error) {
        console.error('Password reset error:', error);
        messageBox.innerHTML = '<div class="alert alert-danger">Failed to reset password.</div>';
        showError('Failed to reset password.');
    }
}

/**
 * Wire up the reset-password form.
 * Call once from main.js after DOMContentLoaded.
 */
export function initResetPassword() {
    const form = getElement('resetPasswordForm');

    if (form) {
        form.addEventListener('submit', handleResetPassword);
    }

    initBootstrapValidation();
}
