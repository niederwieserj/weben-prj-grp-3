// ... (keep your existing signout and password reset code) ...

// Registration Handler
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    console.log("test2");

    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            console.log("test");

            // Bootstrap Validation Check
            if (!this.checkValidity()) {
                this.classList.add('was-validated');
                return;
            }

            // Collect Data
            const formData = {
                action: 'sign-up',
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                zip: document.getElementById('zip').value,
                country: document.getElementById('country').value
            };

            try {
                const response = await fetch('/backend/logic/request_handler.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    // Success: Redirect to login or show success message
                    alert("Account created successfully! Redirecting to login...");
                    // window.location.href = 'sign-in.html';
                } else {
                    // Error: Show message
                    alert("Error: " + result.message);
                    // Optional: Highlight specific fields if backend returns field errors
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert("An unexpected error occurred.");
            }
        });
    }
});
