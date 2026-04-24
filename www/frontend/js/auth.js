document.addEventListener('click', async (e) => {
    if (e.target.id === "btn-sign-out") {
        signout(e);
    }
});

async function signout(e) {
    e.preventDefault();
    e.stopPropagation();

    try {
        const response = await fetch('/backend/controllers/request_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: "signout" })
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('nav-drop-logged-out').style.display = 'block';
            document.getElementById('nav-drop-logged-in').style.display = 'none';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function requestPasswordReset() {
    const emailInput = document.getElementById("resetEmail");
    const messageBox = document.getElementById("resetMessage");

    const email = emailInput.value.trim();

    if (email === "") {
        showToast("Please enter your email.", "text-danger");
        return;
    }

    try {
        const response = await fetch("/backend/controllers/request_handler.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "requestPasswordReset",
                email: email
            })
        });

        const raw = await response.text();
        console.log("RAW RESPONSE:", raw);

        const data = JSON.parse(raw);

        if (data.success) {
            messageBox.innerHTML = `
                <div class="alert alert-success">
                    ${data.message}<br>
                    <a href="${data.reset_link}">Open reset page</a>
                </div>
            `;
        } else {
            showToast(data.message, "text-danger");
        }
    } catch (error) {
        console.error(error);
        showToast("Failed to request password reset.", "text-danger");
    }
}

// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

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
