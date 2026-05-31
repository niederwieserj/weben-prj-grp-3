<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/DbService.php';

class OrderService
{
    private DbService $db;

    public function __construct()
    {
        $this->db = new DbService();
    }

    private function requireAdmin(): void
    {
        if (!isset($_SESSION['user_id']) || empty($_SESSION['is_admin'])) {
            throw new RuntimeException('Admin access required.');
        }
    }


    public function createNewOrder(): array
    {
        $orderCreated = $this->db->createNewOrder();
        if(!$orderCreated){
            return [
                "success" => false,
                "message" => "Order couldn't be completed"
            ];
        } else {
            return [
                "success" => true,
                "message" => "Order confirmed"
            ];
        }
    }

    public function getAllOrders(): array
    {
        $this->requireAdmin();
        return $this->db->getAllOrdersForAdmin();
    }

    public function updateOrderStatus(int $orderId, string $status): array
    {
        $this->requireAdmin();

        $allowedStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

        if (!in_array($status, $allowedStatuses, true)) {
            throw new InvalidArgumentException('Invalid order status.');
        }

        $updated = $this->db->updateOrderStatus($orderId, $status);

        if (!$updated) {
            throw new OutOfBoundsException('Order not found.');
        }

        return [
            'success' => true,
            'message' => 'Order status updated.'
        ];
    }
}