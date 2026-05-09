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

    public function getCategories(): array
    {
        $categories = $this->db->getCategories();

        if (!$categories) {
            return ['success' => false, 'message' => 'Categories not found.'];
        }

        return ['success' => true, 'categories' => $categories];
    }

    /**
     * Get all products with images.
     */
    public function getProductsWithImages(?string $search = null): array
    {
        $products = $this->db->getAllProductsWithImages($search);

        if (!$products) {
            return ['success' => false, 'message' => 'Product not found.'];
        }

        return ['success' => true, 'products' => $products];
    }

    /**
     * Get single product by ID with images.
     */
    public function getProductByIdWithImages(int $id): array
    {
        $products = $this->db->getProductByIdWithImages($id);

        if (!$products) {
            return ['success' => false, 'message' => 'Product not found.'];
        }

        return ['success' => true, 'products' => $products];
    }

    /**
     * Get rating by ID.
     */
    public function getRatingById(int $id): array
    {
        $rating = $this->db->getRatingById($id);

        if (!$rating) {
            return ['success' => false, 'message' => 'No rating found for product.'];
        }

        return ['success' => true, 'rating' => $rating->toArray()];
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