<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/db_service.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/product.class.php';

class ProductService
{
    private DbService $db;

    public function __construct()
    {
        $this->db = new DbService();
    }

    /**
     * Get a single product by ID.
     */
    public function getProduct(int $productId): array
    {
        $product = $this->db->getProductById($productId);

        if (!$product) {
            return ['success' => false, 'message' => 'Product not found.'];
        }

        return ['success' => true, 'product' => $product->toArray()];
    }

    /**
     * Get all products.
     */
    public function getAllProducts(): array
    {
        $products = $this->db->getAllProducts();

        return ['success' => true, 'products' => array_map(fn($p) => $p->toArray(), $products)];
    }
}