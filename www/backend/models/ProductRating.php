<?php
/**
 * ProductRating Model
 * Represents the product_ratings data structure only.
 */
class ProductRating {
    private int $ratingId;
    private int $productId;
    private int $userId;
    private int $score;
    private ?string $comment;
    private string $createdAt;

    public function __construct(array $data) {
        $this->ratingId = (int)($data['rating_id'] ?? 0);
        $this->productId = (int)($data['product_id'] ?? 0);
        $this->userId = (int)($data['user_id'] ?? 0);
        $this->score = (int)($data['score'] ?? 1);
        $this->comment = $data['comment'] ?? null;
        $this->createdAt = $data['created_at'] ?? '';
    }

    // Getters
    public function getRatingId(): int { return $this->ratingId; }
    public function getProductId(): int { return $this->productId; }
    public function getUserId(): int { return $this->userId; }
    public function getScore(): int { return $this->score; }
    public function getComment(): ?string { return $this->comment; }
    public function getCreatedAt(): string { return $this->createdAt; }

    public function toArray(): array {
        return [
            'rating_id' => $this->ratingId,
            'product_id' => $this->productId,
            'user_id' => $this->userId,
            'score' => $this->score,
            'comment' => $this->comment,
            'created_at' => $this->createdAt
        ];
    }
}
