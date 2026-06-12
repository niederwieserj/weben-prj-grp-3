/**
 * validators.js — Bootstrap 5 client-side form validation.
 *
 * call initBootstrapValidation() once after DOMContentLoaded.
 * attach submit listeners to every <form class="needs-validation">
 * prevents submission when native constraint validation fails.
 */

/**
 * Initialise Bootstrap-styled validation on all matching forms
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
 * reset validation state on form
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
