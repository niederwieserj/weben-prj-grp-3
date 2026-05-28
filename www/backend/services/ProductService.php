<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/DbService.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/Product.php';

class ProductService
{
    private DbService $db;

    public function __construct()
    {
        $this->db = new DbService();
    }

    public function getCategories(): array
    {
        return $this->db->getCategories();
    }

    /**
     * Get all products with images.
     */
    public function getProductsWithImages(?string $search = null): array
    {
        return $this->db->getAllProductsWithImages($search);
    }

    /**
     * Get single product by ID with images.
     */
    public function getProductByIdWithImages(int $id): array
    {
        $products = $this->db->getProductByIdWithImages($id);

        if (!$products) {
            throw new OutOfBoundsException('Product not found.');
        }

        return $products;
    }

    /**
     * Get rating by ID.
     */
    public function getRatingById(int $id): ProductRating
    {
        $rating = $this->db->getRatingById($id);

        if (!$rating) {
            throw new OutOfBoundsException('Product rating not found.');
        }

        return $rating;
    }

    /**
     * Get a single product by ID.
     */
    public function getProduct(int $productId): Product
    {
        $product = $this->db->getProductById($productId);

        if (!$product) {
            throw new OutOfBoundsException('Product not found.');
        }

        return $product;
    }

    /**
     * Get all products.
     */
    public function getAllProducts(): array
    {
        $products = $this->db->getAllProducts();

        return array_map(fn($p) => $p->toArray(), $products);
    }
}