document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); // STOP the page reload!

    const formData = new FormData(e.target);

    const data = Object.fromEntries(formData.entries());
    data.action = 'login'; // Add the action for your PHP handler
    data['remember-me'] = document.getElementById('remember-me').checked;

    console.log(data);

    fetch('/backend/logic/request_handler.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                document.getElementById('nav-drop-logged-out').style.display = 'none';
                document.getElementById('nav-drop-logged-in').style.display = 'block';
                window.location.replace("home.html");
            } else {
                document.getElementById('logo').innerText = result.message;
            }
        });
});
