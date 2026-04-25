
import { apiGet } from '../modules/api.js';

async function loadProducts() {
    const response = await fetch('/frontend/components/product-card.html');
    const productCardTemplate = await response.text();

    // Parse the HTML string into a DOM element
    const parser = new DOMParser();
    const productCardDoc = parser.parseFromString(productCardTemplate, 'text/html');

    console.log(productCardDoc);

    const data = await apiGet('/backend/controllers/request_handler.php', {}, { action: 'getAllProducts', product_id: 1 });
    console.log(data);

    const productGrid = document.getElementById('product-grid');
    const cardTemplate = productCardDoc.querySelector('#template')

    data['products'].forEach(element => {
        const productToInsert = cardTemplate.cloneNode(true);
        
        productToInsert.querySelector('#product-name').textContent = element['name'];
        productToInsert.querySelector('#product-description').textContent = element['description'];
        productToInsert.querySelector('#product-price').textContent = element['price'] + ' €';
        

        productGrid.appendChild(productToInsert);
    });
}

window.addEventListener('layout-ready', () => {
    loadProducts();
});