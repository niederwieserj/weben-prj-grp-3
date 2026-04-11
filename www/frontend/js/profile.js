async function loadUserData() {
    try {
        const response = await fetch("/backend/logic/request_handler.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "getUserData"
            })
        });

        const data = await response.json();

        if (!data.success) {
            showMessage(data.message, "danger");
            return;
        }

        const user = data.user;

        document.getElementById("title").value = user.title ?? "";
        document.getElementById("first_name").value = user.first_name ?? "";
        document.getElementById("last_name").value = user.last_name ?? "";
        document.getElementById("username").value = user.username ?? "";
        document.getElementById("email").value = user.email ?? "";
    } catch (error) {
        showMessage("Failed to load user data.", "danger");
        console.error(error);
    }
}

async function saveUserData() {
    const payload = {
        action: "updateUserData",
        title: document.getElementById("title").value,
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        username: document.getElementById("username").value,
        email: document.getElementById("email").value
    };

    try {
        const response = await fetch("/backend/logic/request_handler.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            showMessage(data.message, "success");
        } else {
            showMessage(data.message, "danger");
        }
    } catch (error) {
        showMessage("Failed to save user data.", "danger");
        console.error(error);
    }
}

function showMessage(message, type) {
    const msg = document.getElementById("message");
    msg.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
}

document.addEventListener("DOMContentLoaded", loadUserData);