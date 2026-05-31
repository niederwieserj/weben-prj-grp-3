<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/DbService.php';

class CartController
{
    public static function action(string $requestMethod, array $input, array $getParams, array $postParams): array
    {
        $db = new DbService();
        $userId = $_SESSION['user_id'] ?? null;
        $action = $getParams['action'] ?? null;

        // ********************************************************
        // ************** user not logged in (guest) **************
        // ********************************************************
        if (!$userId) {
            // initialize guest array if not already existing
            if (!isset($_SESSION['guest_cart'])) {
                $_SESSION['guest_cart'] = [];
            }

            // Handle Read for Guests
            if ($requestMethod === 'GET' && $action === 'get') {
                return array_values($_SESSION['guest_cart']);
            }

            
            if ($requestMethod === 'POST') {
                $productId = (int)($input['product_id'] ?? 0);
                if ($productId <= 0 && $action !== 'clear') {
                    return array_values($_SESSION['guest_cart']);
                }

                switch ($action) {
                    case 'add':
                    case 'increase':
                        if (isset($_SESSION['guest_cart'][$productId])) {
                            $_SESSION['guest_cart'][$productId]['quantity']++;
                        } else {
                            
                            $_SESSION['guest_cart'][$productId] = [
                                'id'       => $productId,
                                'name'     => $input['name'] ?? 'Product',
                                'price'    => (float)($input['price'] ?? 0),
                                'imageUrl' => $input['imageUrl'] ?? '',
                                'quantity' => 1
                            ];
                        }
                        break;

                    case 'decrease':
                        if (isset($_SESSION['guest_cart'][$productId])) {
                            $_SESSION['guest_cart'][$productId]['quantity']--;
                            if ($_SESSION['guest_cart'][$productId]['quantity'] <= 0) {
                                unset($_SESSION['guest_cart'][$productId]);
                            }
                        }
                        break;

                    case 'remove':
                        unset($_SESSION['guest_cart'][$productId]);
                        break;

                    case 'clear':
                        $_SESSION['guest_cart'] = [];
                        break;

                    default:
                        throw new InvalidArgumentException('Invalid cart action.');
                }

                return array_values($_SESSION['guest_cart']);
            }

            throw new InvalidArgumentException('Invalid request method.');
        }

        // ********************************************************
        // ******************* logged in user *********************
        // ********************************************************
        
        if ($requestMethod === 'GET' && $action === 'get') {
            return $db->getCartItems($userId);
        }

        // add, increase, decrease, remove item or clear whole cart
        if ($requestMethod === 'POST') {
            $productId = (int)($input['product_id'] ?? 0);

            switch ($action) {
                case 'add':
                    if ($productId > 0) $db->addCartItem($userId, $productId);
                    break;

                case 'increase':
                    if ($productId > 0) $db->increaseCartItemQuantity($userId, $productId);
                    break;

                case 'decrease':
                    if ($productId > 0) $db->decreaseCartItemQuantity($userId, $productId);
                    break;

                case 'remove':
                    if ($productId > 0) $db->removeCartItem($userId, $productId);
                    break;

                case 'clear':
                    $db->clearCart($userId);
                    break;

                default:
                    throw new InvalidArgumentException('Invalid cart action.');
            }

            
            return $db->getCartItems($userId);
        }

        throw new InvalidArgumentException('Invalid request method.');
    }
}

?>