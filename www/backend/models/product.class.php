<?php
/**
 * Product Model
 * Represents the product data structure only.
 */
class Product {
    private int $productId;
    private string $name;
    private string $description;
    private float $avgRating;
    private int $totalRatingsCount;
    private float $price;
    private int $stockQuantity;
    private ?int $fkCategoryId;
    private string $createdAt;

    public function __construct(array $data) {
        $this->productId = (int)($data['product_id'] ?? 0);
        $this->name = $data['name'] ?? '';
        $this->description = $data['description'] ?? '';
        $this->avgRating = (float)($data['avg_rating'] ?? 0.0);
        $this->totalRatingsCount = (int)($data['total_ratings_count'] ?? 0);
        $this->price = (float)($data['price'] ?? 0.0);
        $this->stockQuantity = (int)($data['stock_quantity'] ?? 0);
        $this->fkCategoryId = isset($data['fk_category_id']) ? (int)$data['fk_category_id'] : null;
        $this->createdAt = $data['created_at'] ?? '';
    }

    // Getters
    public function getProductId(): int { return $this->productId; }
    public function getName(): string { return $this->name; }
    public function getDescription(): string { return $this->description; }
    public function getAvgRating(): float { return $this->avgRating; }
    public function getTotalRatingsCount(): int { return $this->totalRatingsCount; }
    public function getPrice(): float { return $this->price; }
    public function getStockQuantity(): int { return $this->stockQuantity; }
    public function getFkCategoryId(): ?int { return $this->fkCategoryId; }
    public function getCreatedAt(): string { return $this->createdAt; }

    // Convenience methods
    public function isInStock(): bool { return $this->stockQuantity > 0; }
    public function getFormattedPrice(): string { return number_format($this->price, 2); }

    public function toArray(): array {
        return [
            'product_id' => $this->productId,
            'name' => $this->name,
            'description' => $this->description,
            'avg_rating' => $this->avgRating,
            'total_ratings_count' => $this->totalRatingsCount,
            'price' => $this->price,
            'stock_quantity' => $this->stockQuantity,
            'fk_category_id' => $this->fkCategoryId,
            'created_at' => $this->createdAt
        ];
    }
}