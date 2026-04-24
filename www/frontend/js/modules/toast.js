/**
 * toast.js — Bootstrap toast notification system.
 * 
 * Provides a centralized way to show temporary notifications
 * with different severity levels (success, danger, warning, info).
 */

/**
 * Show a Bootstrap toast notification.
 *
 * @param {string} message - The message to display
 * @param {'success'|'danger'|'warning'|'info'} severity - Bootstrap color class (text-success, text-danger, etc.)
 * @param {number} [delay=4000] - Auto-hide delay in milliseconds
 * @param {string} [toastId='loginToast'] - ID of the toast element in DOM
 */
export function showToast(message, severity = 'info', delay = 4000, toastId = 'loginToast') {
    const toastEl = document.getElementById(toastId);
    const severityEl = document.getElementById('severityIndicator');

    if (!toastEl) {
        console.warn('Toast: Toast element not found. Message:', message);
        return;
    }

    // Update the toast body with the message
    const toastBody = toastEl.querySelector('.toast-body');
    if (toastBody) {
        toastBody.textContent = message;
    }

    // Clear previous severity classes and add new one
    if (severityEl) {
        severityEl.classList.remove('text-success', 'text-danger', 'text-warning', 'text-info');
        severityEl.classList.add(severity);
    }

    // Create or get Bootstrap Toast instance
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, {
        delay: delay,
        autohide: true
    });

    toast.show();
}

/**
 * Show a success notification.
 *
 * @param {string} message
 * @param {number} [delay=4000]
 */
export function showSuccess(message, delay = 4000) {
    showToast(message, 'text-success', delay);
}

/**
 * Show an error notification.
 *
 * @param {string} message
 * @param {number} [delay=4000]
 */
export function showError(message, delay = 4000) {
    showToast(message, 'text-danger', delay);
}

/**
 * Show a warning notification.
 *
 * @param {string} message
 * @param {number} [delay=4000]
 */
export function showWarning(message, delay = 4000) {
    showToast(message, 'text-warning', delay);
}

/**
 * Hide the toast manually (useful for dismissing before auto-hide).
 *
 * @param {string} [toastId='loginToast']
 */
export function hideToast(toastId = 'loginToast') {
    const toastEl = document.getElementById(toastId);
    if (toastEl) {
        const toast = bootstrap.Toast.getInstance(toastEl);
        if (toast) {
            toast.hide();
        }
    }
}
