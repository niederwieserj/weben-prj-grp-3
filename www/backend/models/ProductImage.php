<?php
/**
 * ProductImage Model
 * Represents the product_images data structure only.
 */
class ProductImage implements JsonSerializable {
    private int $imageId;
    private int $fkProductId;
    private string $imageUrl;
    private ?string $altText;
    private int $sortOrder;
    private bool $isPrimary;
    private string $createdAt;

    public function __construct(array $data) {
        $this->imageId = (int)($data['image_id'] ?? 0);
        $this->fkProductId = (int)($data['fk_product_id'] ?? 0);
        $this->imageUrl = $data['image_url'] ?? '';
        $this->altText = $data['alt_text'] ?? null;
        $this->sortOrder = (int)($data['sort_order'] ?? 0);
        $this->isPrimary = (bool)($data['is_primary'] ?? false);
        $this->createdAt = $data['created_at'] ?? '';
    }

    // Getters
    public function getImageId(): int { return $this->imageId; }
    public function getFkProductId(): int { return $this->fkProductId; }
    public function getImageUrl(): string { return $this->imageUrl; }
    public function getAltText(): ?string { return $this->altText; }
    public function getSortOrder(): int { return $this->sortOrder; }
    public function isPrimary(): bool { return $this->isPrimary; }
    public function getCreatedAt(): string { return $this->createdAt; }

    public function toArray(): array {
        return [
            'image_id' => $this->imageId,
            'fk_product_id' => $this->fkProductId,
            'image_url' => $this->imageUrl,
            'alt_text' => $this->altText,
            'sort_order' => $this->sortOrder,
            'is_primary' => $this->isPrimary,
            'created_at' => $this->createdAt
        ];
    }

    public function jsonSerialize(): array {
        return [
            'image_id' => $this->imageId,
            'fk_product_id' => $this->fkProductId,
            'image_url' => $this->imageUrl,
            'alt_text' => $this->altText,
            'sort_order' => $this->sortOrder,
            'is_primary' => $this->isPrimary,
            'created_at' => $this->createdAt
        ];
    }
}