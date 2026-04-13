// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        // insertResourceById('theme-placeholder', '/frontend/components/theme.html'),
        insertResourceById('head-placeholder', '/frontend/components/head.html'),
        insertResourceById('navbar-placeholder', '/frontend/components/navbar.html'),
        insertResourceById('footer-placeholder', '/frontend/components/footer.html')
    ])

    await loadScript('/frontend/bootstrap/js/bootstrap.bundle.min.js');
    // await loadScript('/frontend/bootstrap/color-modes/color-modes.js');

    await loadUserState();
});

async function insertResourceById(id, path) {
    try {
        const response = await fetch(path);
        const html = await response.text();

        document.getElementById(id).insertAdjacentHTML('afterbegin', html);
    } catch (error) {
        console.error(`Failed to load ${path}:`, error);
    }
}

function loadScript(src) {
    return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            setTimeout(resolve, 0);
        }
        document.body.appendChild(script);
    });
}

async function loadUserState() {
    try {
        const response = await fetch("/backend/logic/request_handler.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "getUserState"
            })
        });

        const state = await response.json();
        
        if (state.logged_in) {
            // Hide guest-only items
            // Show user menu
            document.getElementById('nav-drop-logged-out').style.display = 'none';
            document.getElementById('nav-drop-logged-in').style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to load user state:', error);
    }
}
