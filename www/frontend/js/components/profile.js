/**
 * components/profile.js
 * Fetches, populates, and saves user profile data.
 * Uses the centralised api.js helper and existing backend actions.
 */

import { apiGet, apiPost } from '../modules/api.js';
import { showToast, showSuccess, showError } from '../modules/toast.js';
import { getElement } from '../modules/utils.js';

const FORM_ID      = 'profile-form';
const ALERT_ID     = 'profile-alert';
const BTN_SAVE_ID  = 'btn-save';
const BTN_DEL_ID   = 'btn-delete-account';

const FIELD_IDS = ['title', 'username', 'first_name', 'last_name', 'email'];


/********************** form enable/disable *********************/

function setFormDisabled(disabled) {
    const inputs = getElement(FORM_ID).querySelectorAll('input, select, button');
    inputs.forEach(el => { el.disabled = disabled; });
}


/********************** load profile data *********************/

async function loadProfile() {
    var user = null;

    try {
        const result = await apiPost('user', 'getUserData');

        if (result.response.ok && result.user) {
            user = result.user;
            getElement('title').value       = user.title_id       ?? '';
            getElement('username').value    = user.username     ?? '';
            getElement('first_name').value  = user.first_name   ?? '';
            getElement('firstName2').innerText  = user.first_name   ?? '';
            getElement('last_name').value   = user.last_name    ?? '';
            getElement('email').value       = user.email        ?? '';
        } else {
            showError(result.message || 'Could not load profile.');
        }
    } catch (err) {
        showError('Network error — please try again.');
    }

    try {
        const result = await apiGet({ controller: 'user', action: 'getAddressByUserId', user_id: user.user_id });
        
        if (result.response.ok && result.address) {
            const address = result.address;
            getElement('address').value = address.address ?? '';
            getElement('country').value = address.country ?? '';
            getElement('city').value = address.city ?? '';
            getElement('zip').value = address.postal_code ?? '';
        } else {
            showError(result.message || 'Could not load address.');
        }
    } catch (err) {
        showError('Network error — please try again.');
    }
}


/********************** save profile data *********************/

async function saveProfile(event) {
    event.preventDefault();

    const form = getElement(FORM_ID);

    // Bootstrap 5 native validation
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const payload = {
        title:      getElement('title').value,
        first_name: getElement('first_name').value,
        last_name:  getElement('last_name').value,
        email:      getElement('email').value
    };

    setFormDisabled(true);

    try {
        const res = await apiPost('user', 'updateUserData', payload);

        if (res.response.ok) {
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


/********************** initialization *********************/

window.addEventListener('layout-ready', () => {
    loadProfile();
    getElement(FORM_ID).addEventListener('submit', saveProfile);
});
