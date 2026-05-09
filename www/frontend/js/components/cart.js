/**
 * cart.js — Shopping cart UI logic.
 * Depends on: modules/cart.js, modules/utils.js, modules/toast.js
 */

import {
    addCartItem,
    removeCartItem,
    increaseCartItemQuantity,
    decreaseCartItemQuantity,
    clearCart,
    getCart,
    getCartItemCount,
    getCartTotalPrice
} from '../modules/cart.js';

import { formatEuro } from '../modules/utils.js';
import { showSuccess } from '../modules/toast.js';

function getProductFromButton(button) {
    const productElement = button.closest('[data-cart-product]');

    if (!productElement) {
        return null;
    }

    return {
        id: productElement.dataset.productId,
        name: productElement.dataset.productName,
        price: productElement.dataset.productPrice,
        imageUrl: productElement.dataset.productImage || ''
    };
}

function handleAddToCart(button) {
    const product = getProductFromButton(button);

    if (!product) {
        console.warn('No product data found for add-to-cart button.');
        return;
    }

    addCartItem(product);
    updateCartBadge();
    renderCheckoutCart();

    showSuccess(`${product.name} added to cart.`);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');

    if (!badge) {
        return;
    }

    const itemCount = getCartItemCount();

    badge.textContent = itemCount;
    badge.style.display = itemCount > 0 ? 'inline-block' : 'none';
}

function renderCheckoutCart() {
    const cartList = document.getElementById('checkout-cart-list');
    const cartBadge = document.getElementById('checkout-cart-count');
    const totalElement = document.getElementById('checkout-cart-total');

    if (!cartList) {
        return;
    }

    const cart = getCart();

    cartList.innerHTML = '';

    if (cartBadge) {
        cartBadge.textContent = getCartItemCount();
    }

    if (cart.length === 0) {
        cartList.innerHTML = `
            <li class="list-group-item text-body-secondary">
                Your cart is empty.
            </li>
        `;

        if (totalElement) {
            totalElement.textContent = formatEuro(0);
        }

        return;
    }

    cart.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center gap-3';

        listItem.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" width="48" height="48" class="object-fit-contain">` : ''}
                <div>
                    <h6 class="my-0">${item.name}</h6>
                    <small class="text-body-secondary">
                        ${formatEuro(item.price)} × ${item.quantity}
                    </small>
                </div>
            </div>

            <div class="d-flex align-items-center gap-2">
                <button type="button" class="btn btn-sm btn-outline-light" data-cart-decrease="${item.id}">−</button>
                <span>${item.quantity}</span>
                <button type="button" class="btn btn-sm btn-outline-light" data-cart-increase="${item.id}">+</button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-cart-remove="${item.id}">
                    Remove
                </button>
            </div>
        `;

        cartList.appendChild(listItem);
    });

    if (totalElement) {
        totalElement.textContent = formatEuro(getCartTotalPrice());
    }
}

function handleCartClick(event) {
    const addButton = event.target.closest('[data-cart-add]');
    const removeButton = event.target.closest('[data-cart-remove]');
    const increaseButton = event.target.closest('[data-cart-increase]');
    const decreaseButton = event.target.closest('[data-cart-decrease]');
    const clearButton = event.target.closest('[data-cart-clear]');

    if (addButton) {
        event.preventDefault();
        event.stopPropagation();
        handleAddToCart(addButton);
        return;
    }

    if (removeButton) {
        removeCartItem(removeButton.dataset.cartRemove);
        updateCartBadge();
        renderCheckoutCart();
        return;
    }

    if (increaseButton) {
        increaseCartItemQuantity(increaseButton.dataset.cartIncrease);
        updateCartBadge();
        renderCheckoutCart();
        return;
    }

    if (decreaseButton) {
        decreaseCartItemQuantity(decreaseButton.dataset.cartDecrease);
        updateCartBadge();
        renderCheckoutCart();
        return;
    }

    if (clearButton) {
        clearCart();
        updateCartBadge();
        renderCheckoutCart();
    }
}

export function initCart() {
    document.addEventListener('click', handleCartClick);

    updateCartBadge();
    renderCheckoutCart();
}