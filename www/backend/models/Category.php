<?php
/**
 * Category Model
 * Represents the product_ratings data structure only.
 */
class Category implements JsonSerializable {
    private int $categoryId;
    private string $name;

    public function __construct(array $data) {
        $this->categoryId = (int)($data['category_id'] ?? 0);
        $this->name = $data['name'] ?? '';
    }

    // Getters
    public function getCategoryId(): int { return $this->categoryId; }
    public function getName(): string { return $this->name; }

    public function jsonSerialize(): array {
        return [
            'category_id' => $this->categoryId,
            'name' => $this->name
        ];
    }
}
