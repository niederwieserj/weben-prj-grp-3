async function resetPassword() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const newPasswordInput = document.getElementById("newPassword");
    const messageBox = document.getElementById("message");

    const newPassword = newPasswordInput.value.trim();

    if (!token) {
        messageBox.innerHTML = `
            <div class="alert alert-danger">
                Missing reset token.
            </div>
        `;
        return;
    }

    if (newPassword === "") {
        messageBox.innerHTML = `
            <div class="alert alert-danger">
                Please enter a new password.
            </div>
        `;
        return;
    }

    try {
        const response = await fetch("/backend/controllers/request_handler.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "resetPassword",
                token: token,
                newPassword: newPassword
            })
        });

        const raw = await response.text();
        console.log("RAW RESET RESPONSE:", raw);

        const data = JSON.parse(raw);

        if (data.success) {
            messageBox.innerHTML = `
                <div class="alert alert-success">
                    ${data.message}<br>
                    <a href="/frontend/sites/sign-in.html">Back to sign in</a>
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
                Failed to reset password.
            </div>
        `;
    }
}