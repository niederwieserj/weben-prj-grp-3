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