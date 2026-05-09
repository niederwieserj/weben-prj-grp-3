/**
 * cart.js — Local shopping cart storage logic.
 * Handles cart data only. No DOM manipulation here.
 */

const CART_STORAGE_KEY = 'coregear_cart';

export function getCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);

    if (!cartJson) {
        return [];
    }

    try {
        return JSON.parse(cartJson);
    } catch (error) {
        console.error('Could not parse cart:', error);
        return [];
    }
}

export function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function addCartItem(product) {
    const cart = getCart();

    const existingItem = cart.find(item => String(item.id) === String(product.id));

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            imageUrl: product.imageUrl || '',
            quantity: 1
        });
    }

    saveCart(cart);
    return cart;
}

export function removeCartItem(productId) {
    const cart = getCart().filter(item => String(item.id) !== String(productId));
    saveCart(cart);
    return cart;
}

export function increaseCartItemQuantity(productId) {
    const cart = getCart();

    const item = cart.find(item => String(item.id) === String(productId));

    if (item) {
        item.quantity += 1;
    }

    saveCart(cart);
    return cart;
}

export function decreaseCartItemQuantity(productId) {
    const cart = getCart();

    const item = cart.find(item => String(item.id) === String(productId));

    if (item) {
        item.quantity -= 1;
    }

    const cleanedCart = cart.filter(item => item.quantity > 0);

    saveCart(cleanedCart);
    return cleanedCart;
}

export function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
}

export function getCartItemCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotalPrice() {
    return getCart().reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);
}