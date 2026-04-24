
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); // STOP the page reload!

    const formData = new FormData(e.target);

    const data = Object.fromEntries(formData.entries());
    data.action = 'login'; // Add the action for your PHP handler
    data['remember-me'] = document.getElementById('remember-me').checked;

    console.log(data);

    fetch('/backend/controllers/request_handler.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // document.getElementById('nav-drop-logged-out').style.display = 'none';
                // document.getElementById('nav-drop-logged-in').style.display = 'block';
                window.location.replace("home.html");
            } else {
                showToast(data.message || 'Invalid username or password.', 'text-danger');
            }
        });
});

function showToast(message, color) {
    const toastEl = document.getElementById('loginToast');
    const severityEl = document.getElementById('severityIndicator');

    if (!toastEl || !severityEl) {
        return;
    }

    // Update the toast body with the specific error message
    const toastBody = toastEl.querySelector('.toast-body');
    if (toastBody) {
        toastBody.textContent = message;
    }

    severityEl.classList.add(color); // e.g. text-success, text-danger, ...

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, {
        delay: 4000
    });

    toast.show();
}
