const BASE_URL = '/backend/request-handler.php?controller=cart';
const GUEST_CART_KEY = 'coregear_cart';


function getGuestCart() {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
}

function saveGuestCart(cart) {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

// ************* check db first, and, if user not logged in, fallback to guest cart logic ***************
function handleCartRequest(ajaxPromise, guestFallbackLogic) {
    const deferred = $.Deferred();
    
    ajaxPromise
        .done(data => deferred.resolve(data))
        .fail(xhr => {
            if (xhr.status === 401) {
                // ** fallback **
                const updatedGuestCart = guestFallbackLogic();
                deferred.resolve(updatedGuestCart);
            } else {
                console.error("Cart error:", xhr);
                deferred.reject(xhr);
            }
        });
        
    return deferred.promise();
}



/***************************************************************************/
// exported cart actions: 
// get cart, add items, remove items, increase/decrease quantitiy, clear cart
/***************************************************************************/

export function getCart() {
    return handleCartRequest(
        $.ajax({ url: `${BASE_URL}&action=get`, method: 'GET', dataType: 'json' }),
        () => getGuestCart()
    );
}



export function addCartItem(product) {
    return handleCartRequest(
        $.ajax({
            url: `${BASE_URL}&action=add`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ product_id: product.id })
        }),
        () => {
            let cart = getGuestCart();
            let item = cart.find(i => String(i.id) === String(product.id));
            
            if (item) {
                item.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    imageUrl: product.imageUrl || '',
                    quantity: 1
                });
            }
            saveGuestCart(cart);
            return cart;
        }
    );
}




export function removeCartItem(productId) {
    return handleCartRequest(
        $.ajax({
            url: `${BASE_URL}&action=remove`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ product_id: productId })
        }),
        () => {
            let cart = getGuestCart().filter(i => String(i.id) !== String(productId));
            saveGuestCart(cart);
            return cart;
        }
    );
}



export function increaseCartItemQuantity(productId) {
    return handleCartRequest(
        $.ajax({
            url: `${BASE_URL}&action=increase`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ product_id: productId })
        }),
        () => {
            let cart = getGuestCart();
            let item = cart.find(i => String(i.id) === String(productId));
            if (item) item.quantity += 1;
            saveGuestCart(cart);
            return cart;
        }
    );
}




export function decreaseCartItemQuantity(productId) {
    return handleCartRequest(
        $.ajax({
            url: `${BASE_URL}&action=decrease`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ product_id: productId })
        }),
        () => {
            let cart = getGuestCart();
            let item = cart.find(i => String(i.id) === String(productId));
            if (item) {
                item.quantity -= 1;
                if (item.quantity <= 0) {
                    cart = cart.filter(i => String(i.id) !== String(productId));
                }
            }
            saveGuestCart(cart);
            return cart;
        }
    );
}



export function clearCart() {
    return handleCartRequest(
        $.ajax({
            url: `${BASE_URL}&action=clear`,
            method: 'POST'
        }),
        () => {
            localStorage.removeItem(GUEST_CART_KEY);
            return [];
        }
    );
}
