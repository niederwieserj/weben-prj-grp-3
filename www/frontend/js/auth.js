document.addEventListener('click', async (e) => {
    if (e.target.id === "btn-sign-out") {
        signout(e);
    }
});

async function signout(e) {
    e.preventDefault();
    e.stopPropagation();

    try {
        const response = await fetch('/backend/logic/request_handler.php', {
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
        messageBox.innerHTML = `<div class="alert alert-danger">Please enter your email.</div>`;
        return;
    }

    try {
        const response = await fetch("/backend/logic/request_handler.php", {
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
        console.log("RAW RESPONSE:", raw); // 🔥 WICHTIG

        const data = JSON.parse(raw);

        if (data.success) {
            messageBox.innerHTML = `
                <div class="alert alert-success">
                    ${data.message}<br>
                    <a href="${data.reset_link}">Open reset page</a>
                </div>
            `;
        } else {
            messageBox.innerHTML = `
                <div class="alert alert-danger">
                    ${data.message}
                </div>
            `;
        }
    } catch (error) {
        console.error(error);
        messageBox.innerHTML = `
            <div class="alert alert-danger">
                Failed to request password reset.
            </div>
        `;
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
