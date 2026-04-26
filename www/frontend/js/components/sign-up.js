// frontend/js/signup.js
import { apiPost } from '../modules/api.js';
import { showError, showSuccess } from '../modules/toast.js';
import { getElement } from '../modules/utils.js';
import { initBootstrapValidation } from '../modules/validators.js';

/**
 * Handle signup form submission.
 *
 * @param {Event} e - Submit event
 */
async function handleSignUp(e) {
    e.preventDefault();

    console.log("here2");
    
    const form = e.target;
    console.log(form);

    const formData = new FormData(form);
    console.log(formData);

    const data = Object.fromEntries(formData.entries());

    console.log(data);
    
    // Add action for backend routing
    data.action = 'sign-up';

    // Disable button to prevent double-submit
        const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
        submitBtn.disabled = true;
        
        const result = await apiPost('sign-up', data);
        
        if (result.success) {
            showSuccess(result.message || 'Registration successful! Redirecting...');
            
            setTimeout(() => {
                window.location.replace('home.html');
            }, 1500);
        } else {
            showError(result.message || 'Registration failed.');
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Sign-up error:', error);
        showError('Failed to connect to server. Please try again.');
        submitBtn.disabled = false;
    }
}

export function initSignUp() {
    const form = getElement('signUpForm');
    
    if (form) {
        form.addEventListener('submit', handleSignUp);
    }
    
    initBootstrapValidation();
}
