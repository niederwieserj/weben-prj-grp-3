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
