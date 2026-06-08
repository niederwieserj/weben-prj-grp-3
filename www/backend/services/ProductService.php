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

    private function requireAdmin(): void
    {
        if (!isset($_SESSION['user_id']) || empty($_SESSION['is_admin'])) {
            throw new RuntimeException('Admin access required.');
        }
    }

    public function createProduct(array $input): array
    {
        $this->requireAdmin();

        $name = trim($input['name'] ?? '');
        $description = trim($input['description'] ?? '');
        $price = (float) ($input['price'] ?? 0);
        $stockQuantity = (int) ($input['stock_quantity'] ?? 0);
        $categoryId = (int) ($input['fk_category_id'] ?? 0);
        $imageUrl = trim($input['image_url'] ?? '');

        if ($name === '') {
            throw new InvalidArgumentException('Product name is required.');
        }

        if ($price <= 0) {
            throw new InvalidArgumentException('Price must be greater than 0.');
        }

        if ($stockQuantity < 0) {
            throw new InvalidArgumentException('Stock quantity must not be negative.');
        }

        if ($categoryId <= 0) {
            throw new InvalidArgumentException('Category is required.');
        }

        $productId = $this->db->createProduct([
            'name' => $name,
            'description' => $description,
            'price' => $price,
            'stock_quantity' => $stockQuantity,
            'fk_category_id' => $categoryId
        ]);

        if ($imageUrl !== '') {
            $this->db->createProductImage($productId, $imageUrl, $name);
        }

        return ['product_id' => $productId];
    }

    public function updateProduct(array $input): array
    {
        $this->requireAdmin();

        $productId = (int) ($input['product_id'] ?? 0);
        $name = trim($input['name'] ?? '');
        $description = trim($input['description'] ?? '');
        $price = (float) ($input['price'] ?? 0);
        $stockQuantity = (int) ($input['stock_quantity'] ?? 0);
        $categoryId = (int) ($input['fk_category_id'] ?? 0);
        $imageUrl = trim($input['image_url'] ?? '');

        if ($productId <= 0) {
            throw new InvalidArgumentException('Product id is required.');
        }

        if ($name === '') {
            throw new InvalidArgumentException('Product name is required.');
        }

        if ($price <= 0) {
            throw new InvalidArgumentException('Price must be greater than 0.');
        }

        if ($stockQuantity < 0) {
            throw new InvalidArgumentException('Stock quantity must not be negative.');
        }

        if ($categoryId <= 0) {
            throw new InvalidArgumentException('Category is required.');
        }

        $updated = $this->db->updateProduct($productId, [
            'name' => $name,
            'description' => $description,
            'price' => $price,
            'stock_quantity' => $stockQuantity,
            'fk_category_id' => $categoryId
        ]);

        if (!$updated) {
            throw new OutOfBoundsException('Product not found.');
        }

        if ($imageUrl !== '') {
            $this->db->upsertPrimaryProductImage($productId, $imageUrl, $name);
        }

        return [];
    }
}