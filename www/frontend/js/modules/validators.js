/**
 * validators.js — Bootstrap 5 client-side form validation.
 *
 * Call initBootstrapValidation() once after DOMContentLoaded.
 * It attaches submit listeners to every <form class="needs-validation">
 * and prevents submission when native constraint validation fails.
 */

/**
 * Initialise Bootstrap-styled validation on all matching forms.
 * Safe to call multiple times — listeners are only attached once
 * via a data attribute guard.
 */
export function initBootstrapValidation() {
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        if (form.dataset.validationInitialized) return;

        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);

        form.dataset.validationInitialized = 'true';
    });
}

/**
 * Manually reset validation state on a form (useful after AJAX submit).
 *
 * @param {HTMLFormElement} form
 */
export function resetFormValidation(form) {
    form.classList.remove('was-validated');
    form.noValidate = false;
}

/**
 * Check whether a single field satisfies its constraints
 * and apply the Bootstrap .is-valid / .is-invalid classes.
 *
 * @param {HTMLElement} field
 * @returns {boolean}
 */
export function validateField(field) {
    const valid = field.checkValidity();
    field.classList.toggle('is-valid', valid);
    field.classList.toggle('is-invalid', !valid);
    return valid;
}
