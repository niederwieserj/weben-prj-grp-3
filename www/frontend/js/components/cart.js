import {
    getCart,
    addCartItem,
    removeCartItem,
    increaseCartItemQuantity,
    decreaseCartItemQuantity,
    clearCart
} from '../modules/cart.js';

import { formatEuro } from '../modules/utils.js';
import { showSuccess } from '../modules/toast.js';

// refresh cart elements
function updateCartUI(cartItems) {
    const items = Array.isArray(cartItems) ? cartItems : [];
    
    // calculate item counts
    const itemCount = items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const $badge = $('#cart-badge');

    if (itemCount >= 0) {
        $badge.removeClass('d-none');
    } else {
        $badge.addClass('d-none');
    }
    
    $badge.text(itemCount).toggle(itemCount >= 0);

    // get checkout elements
    const $cartList = $('#checkout-cart-list');
    const $cartBadge = $('#checkout-cart-count');
    const $totalElement = $('#checkout-cart-total');

    if (!$cartList.length) return;

    if ($cartBadge.length) {
        $cartBadge.text(itemCount);
    }

    $cartList.empty();

    // render empty cart list
    if (items.length === 0) {
        $cartList.html(`
            <li class="list-group-item text-body-secondary">
                Your cart is empty.
            </li>
        `);
        if ($totalElement.length) {
            $totalElement.text(formatEuro(0));
        }
        return;
    }

    // display cart items w/price and quantity
    let totalPrice = 0;

    items.forEach(item => {
        totalPrice += Number(item.price) * Number(item.quantity);

        const listItem = `
            <li class="list-group-item d-flex justify-content-between align-items-center gap-3">
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
                    <button type="button" class="btn btn-sm btn-outline-light border-0" data-cart-decrease="${item.id}">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="btn btn-sm btn-outline-light border-0" data-cart-increase="${item.id}">+</button>
                    <button type="button" class="btn btn-sm btn-outline-danger border-0" data-cart-remove="${item.id}">
                        <svg class="bi pt-1" width="20" height="20" fill="currentColor">
                            <use xlink:href="/frontend/bootstrap-icons/bootstrap-icons.svg#trash" />
                        </svg>
                    </button>
                </div>
            </li>
        `;
        $cartList.append(listItem);
    });

    if ($totalElement.length) {
        $totalElement.text(formatEuro(totalPrice));
    }
}

/******************************************************************/
/*                       add items to cart                        */
/******************************************************************/

function handleAddToCart($button) {
    const $productElement = $button.closest('[data-cart-product]');
    if (!$productElement.length) return;

    // get details of products
    const payload = {
        product_id: $productElement.attr('data-product-id'),
        name: $productElement.attr('data-product-name'),
        price: parseFloat($productElement.attr('data-product-price')) || 0,
        imageUrl: $productElement.attr('data-product-image') || ''
    };

    $.ajax({
        url: '/backend/request-handler.php?controller=cart&action=add',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload)
    })
    .done(function(updatedCart) {
        updateCartUI(updatedCart);
        
    })
    .fail(function(xhr) {
        console.error("Cart error:", xhr);
    });
}

/******************************************************************/
/*                        initialize cart                         */
/******************************************************************/

export function initCart() {
    // fetch to create UI on load
    getCart().done(updateCartUI);

    // event handlers removed before adding them, so the script doesnt add 2 event handlers when running multiple times
    $(document).off('click', '[data-cart-add]').on('click', '[data-cart-add]', function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleAddToCart($(this));
    });

    $(document).off('click', '[data-cart-remove]').on('click', '[data-cart-remove]', function() {
        const productId = $(this).data('cartRemove');
        removeCartItem(productId).done(updateCartUI);
    });

    $(document).off('click', '[data-cart-increase]').on('click', '[data-cart-increase]', function() {
        const productId = $(this).data('cartIncrease');
        increaseCartItemQuantity(productId).done(updateCartUI);
    });

    $(document).off('click', '[data-cart-decrease]').on('click', '[data-cart-decrease]', function() {
        const productId = $(this).data('cartDecrease');
        decreaseCartItemQuantity(productId).done(updateCartUI);
    });

    $(document).off('click', '[data-cart-clear]').on('click', '[data-cart-clear]', function() {
        clearCart().done(function() {
            updateCartUI([]);
        });
    });    
}
