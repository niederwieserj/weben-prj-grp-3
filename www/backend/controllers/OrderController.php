<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/OrderService.php';

class OrderController
{
    public static function action(string $requestMethod, array $input, array $getParams, array $postParams): array
    {
        $orderService = new OrderService();
        $action = $getParams['action'] ?? null;

        if ($requestMethod === 'GET') {
            switch ($action) {
                case 'getAllOrders':
                    return $orderService->getAllOrders();

                default:
                    throw new InvalidArgumentException('Invalid action.');
            }
        }

        if ($requestMethod === 'POST') {
            switch ($action) {
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