/**
 * layout.js — Shell loader and environment initializer.
 * 
 * Responsibilities:
 * 1. Inject layout components (navbar, footer, head).
 * 2. Load Bootstrap JS (since we aren't using a bundler).
 * 3. Load user session state.
 * 4. Signal 'app-ready' when everything is initialized.
 */

import { apiPost } from "./modules/api.js";

// Configuration
const COMPONENTS = {
    head: '/frontend/components/head.html',
    navbar: '/frontend/components/navbar.html',
    footer: '/frontend/components/footer.html',
    toast: '/frontend/components/toast.html',
    // theme: '/frontend/components/theme.html' // Uncomment if needed
};

/**
 * Fetch and inject HTML into a specific container ID.
 * @param {string} id - Target container ID
 * @param {string} path - Relative path to HTML fragment
 */
async function insertResourceById(id, path) {
    const container = document.getElementById(id);
    if (!container) {
        console.warn(`Layout: Container #${id} not found. Skipping ${path}.`);
        return;
    }

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const html = await response.text();
        container.insertAdjacentHTML('afterbegin', html);
    } catch (error) {
        console.error(`Layout: Failed to load ${path}:`, error);
    }
}

/**
 * Dynamically load a script and return a promise.
 * @param {string} src - Script URL
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript'; // Ensure it's treated as JS
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        
        document.body.appendChild(script);
    });
}

/**
 * Fetch user session state and toggle UI elements.
 */
async function loadUserState() {
    try {
        /*const response = await fetch("/backend/request-handler.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ controller: "user", action: "getUserState" })
        });*/

        const dropLoggedOut = document.getElementById('nav-drop-logged-out');
        const dropLoggedIn = document.getElementById('nav-drop-logged-in');

        const result = await apiPost("user", "getUserState");
        
        if (result.response.ok && result.logged_in) {
            if (dropLoggedOut) dropLoggedOut.style.display = 'none';
            if (dropLoggedIn) dropLoggedIn.style.display = 'block';
        } else {
            if (dropLoggedOut) dropLoggedOut.style.display = 'block';
            if (dropLoggedIn) dropLoggedIn.style.display = 'none';
        }
    } catch (error) {
        console.error('Layout: Failed to load user state:', error);
        // Fallback: Assume logged out if API fails
        const dropLoggedIn = document.getElementById('nav-drop-logged-in');
        if (dropLoggedIn) dropLoggedIn.style.display = 'none';
    }
}

/**
 * Main initialization sequence.
 */
async function initLayout() {
    // 1. Load layout components in parallel
    await Promise.all([
        insertResourceById('head-placeholder', COMPONENTS.head),
        insertResourceById('navbar-placeholder', COMPONENTS.navbar),
        insertResourceById('footer-placeholder', COMPONENTS.footer),
        insertResourceById('toast-placeholder', COMPONENTS.toast)
    ]);

    // 2. Load Bootstrap Bundle (Required for dropdowns, modals, etc.)
    // Note: We load this BEFORE main.js so Bootstrap is available globally
    await loadScript('/frontend/bootstrap/js/bootstrap.bundle.min.js');

    // 3. Load user state (Async, doesn't block UI rendering)
    loadUserState();

    // 4. Dispatch custom event to signal that the environment is ready
    // This allows main.js (which runs asynchronously) to know when to attach listeners
    window.dispatchEvent(new CustomEvent('layout-ready', { detail: { timestamp: Date.now() } }));
}

// Start the process immediately
document.addEventListener('DOMContentLoaded', initLayout);
