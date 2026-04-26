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

export function createStarsFromRating(rating) {
    let stars = [];

    if (rating < 1) {
        // No rating -> 5 empty stars
        for (let i = 0; i < 5; i++) {
            const star = createStar('star');
            stars.push(star);
        }
    } else {
        if (roundTo(rating % 1, 1) >= 0.8) {
            rating = Math.ceil(rating);
        }

        // Full stars
        for (let i = 0; i < Math.trunc(rating); i++) {
            const star = createStar('star-fill', 'text-warning');
            stars.push(star);
        }

        // Optional half star
        if (roundTo(rating % 1, 1) > 0.2 && roundTo(rating % 1, 1) < 0.8) {
            console.log(rating);
            console.log(roundTo(rating % 1, 1));
            const star = createStar('star-half', 'text-warning');
            stars.push(star);
            rating++; // We need one less empty star now
        }

        // Emtpy stars
        for (let i = Math.trunc(rating); i < 5; i++) {
            const star = createStar('star', 'text-warning');
            stars.push(star);
        }
    }

    return stars;
}

export function roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
    if (n < 0) {
        negative = true;
        n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(digits);
    if (negative) {
        n = (n * -1).toFixed(digits);
    }
    return n;
}

export function createStar(iconName, textColor) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const star = document.createElementNS(SVG_NS, 'svg');
    star.classList.add('bi');
    star.classList.add('me-1');
    star.classList.add(textColor)
    star.setAttribute('width', '14');
    star.setAttribute('height', '14');
    star.setAttribute('fill', 'currentColor');

    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        '/frontend/bootstrap-icons/bootstrap-icons.svg#' + iconName);

    star.appendChild(use);
    return star;
}
