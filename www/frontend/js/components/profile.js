/**
 * components/profile.js
 * Fetches, populates, and saves user profile data.
 * Uses the centralised api.js helper and existing backend actions.
 */

import { apiPost } from '../modules/api.js';
import { showToast, showSuccess, showError } from '../modules/toast.js';
import { getElement } from '../modules/utils.js';

const FORM_ID      = 'profile-form';
const ALERT_ID     = 'profile-alert';
const BTN_SAVE_ID  = 'btn-save';
const BTN_DEL_ID   = 'btn-delete-account';

const FIELD_IDS = ['title', 'username', 'first_name', 'last_name', 'email'];

/* ── Helpers ─────────────────────────────────────────────── */

function setFormDisabled(disabled) {
    const inputs = $(FORM_ID).querySelectorAll('input, select, button');
    inputs.forEach(el => { el.disabled = disabled; });
}

/* ── Load ────────────────────────────────────────────────── */

async function loadProfile() {
    try {
        const res = await apiPost('user', 'getUserData');

        console.info(res);

        if (res.success && res.user) {
            const u = res.user;
            getElement('title').value       = u.title       ?? '';
            getElement('username').value    = u.username     ?? '';
            getElement('first_name').value  = u.first_name   ?? '';
            getElement('last_name').value   = u.last_name    ?? '';
            getElement('email').value       = u.email        ?? '';
        } else {
            showError(res.message || 'Could not load profile.');
        }
    } catch (err) {
        showError('Network error — please try again.');
    }
}

/* ── Save ────────────────────────────────────────────────── */

async function saveProfile(event) {
    event.preventDefault();

    const form = $(FORM_ID);

    // Bootstrap 5 native validation
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const payload = {
        title:      $('title').value,
        first_name: $('first_name').value,
        last_name:  $('last_name').value,
        email:      $('email').value
    };

    setFormDisabled(true);

    try {
        const res = await apiPost('user', 'updateUserData', payload);

        if (res.success) {
            showSuccess('Profile updated successfully.');
            form.classList.remove('was-validated');
        } else {
            showError(res.message || 'Update failed.');
        }
    } catch (err) {
        showError('Network error — please try again.');
    } finally {
        setFormDisabled(false);
    }
}

/* ── Delete Account (placeholder) ────────────────────────── */

function handleDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        // TODO: call apiPost('deleteAccount') when implemented
        showError('Account deletion is not yet implemented.');
    }
}

/* ── Init ────────────────────────────────────────────────── */

window.addEventListener('layout-ready', () => {
    loadProfile();
    getElement(FORM_ID).addEventListener('submit', saveProfile);
    getElement(BTN_DEL_ID).addEventListener('click', handleDeleteAccount);
});