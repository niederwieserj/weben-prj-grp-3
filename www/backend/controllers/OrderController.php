<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/OrderService.php';

class OrderController
{
    public static function action(string $requestMethod, array $input, array $getParams, array $postParams): array
    {
        $orderService = new OrderService();
        $action = $getParams['action'] ?? null;
        $userId = $_SESSION['user_id'] ?? null;

        if ($requestMethod === 'GET') {
            switch ($action) {
                case 'getAllOrders':
                    return $orderService->getAllOrders();
                
                case 'getOrdersByUserId':
                    return $orderService->getOrdersByUserId($userId);    

                default:
                    throw new InvalidArgumentException('Invalid action.');
            }
        }

        if ($requestMethod === 'POST') {
            $productId = (int)($input['product_id'] ?? 0);

            switch ($action) {
                case 'createNewOrder':
                    if (empty($userId)) {
                        throw new InvalidArgumentException('Not logged in.');
                    }

                    return $orderService->createNewOrder($userId);
                
                case 'updateOrderStatus':
                    $orderId = (int)($input['order_id'] ?? 0);
                    $status = $input['status'] ?? '';

                    return $orderService->updateOrderStatus($orderId, $status);

                default:
                    throw new InvalidArgumentException('Invalid action.');
            }
        }

        throw new InvalidArgumentException('Invalid request method.');
    }
}