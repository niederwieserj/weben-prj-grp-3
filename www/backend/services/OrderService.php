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

    public function createNewOrder(int $userId): array
    {
        if (!$userId) {
            throw new RuntimeException('You must be logged in to place an order.');
        }

        $cartItems = $this->db->getCartItems($userId);

        if (empty($cartItems)) {
            throw new RuntimeException('Your cart is empty.');
        }

        try {
            $totalAmount = 0.0;
            foreach ($cartItems as $item) {
                $totalAmount += (float) $item['price'] * (int) $item['quantity'];
            }

            $this->db->beginTransaction();
            $orderId = $this->db->createNewOrder($userId, $totalAmount, $cartItems);
            $this->db->clearCart($userId);
            $this->db->commit();

            return ["order_id" => $orderId];
        } catch (Exception $e) {
            $this->db->rollback();

            throw new RuntimeException("Order couldn't be completed.");
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

        return [];
    }


    public function getOrdersByUserId(int $userId): array
    {
        if (!$userId) {
            throw new Exception("Must be a registered user");
        }
        
        return $this->db->getOrdersByUserId($userId);
    }
}
