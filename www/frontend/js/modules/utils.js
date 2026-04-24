/**
 * utils.js — Small, reusable helpers shared across components.
 */

/**
 * Toggle visibility of two elements that represent mutually exclusive states.
 *
 * @param {string} showId  — element id to display
 * @param {string} hideId  — element id to hide
 */
export function toggleVisibility(showId, hideId) {
    const showEl = document.getElementById(showId);
    const hideEl = document.getElementById(hideId);

    if (showEl) showEl.style.display = 'block';
    if (hideEl) hideEl.style.display = 'none';
}

/**
 * Safely get a DOM element by id, with an optional warning.
 *
 * @param {string} id
 * @returns {HTMLElement|null}
 */
export function getElement(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`Element #${id} not found.`);
    }
    return el;
}

/**
 * Debounce a function call.
 *
 * @param {Function} fn
 * @param {number}   delay — milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Format a number as EUR currency.
 *
 * @param {number} amount
 * @returns {string}
 */
export function formatEuro(amount) {
    return new Intl.NumberFormat('de-AT', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

/**
 * Show a Bootstrap alert inside a container element.
 *
 * @param {HTMLElement} container — the element that receives the alert HTML
 * @param {'success'|'danger'|'warning'|'info'} type — Bootstrap alert type
 * @param {string}      message  — HTML-safe message (or raw HTML if intentional)
 */
export function showAlert(container, type, message) {
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}
