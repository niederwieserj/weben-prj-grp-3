<?php
/**
 * User Model
 * Represents the user data structure only.
 */
class User {
    private int $userId;
    private string $username;
    private string $email;
    private string $passwordHash;
    private string $firstName;
    private string $lastName;
    private string $title;
    private bool $isAdmin;
    private bool $isActive;
    private string $createdAt;

    public function __construct(array $data) {
        $this->userId = $data['user_id'] ?? 0;
        $this->username = $data['username'] ?? '';
        $this->email = $data['email'] ?? '';
        $this->passwordHash = $data['password_hash'] ?? '';
        $this->firstName = $data['first_name'] ?? '';
        $this->lastName = $data['last_name'] ?? '';
        $this->title = $data['title'] ?? '';
        $this->isAdmin = (bool)($data['is_admin'] ?? false);
        $this->isActive = (bool)($data['is_active'] ?? true);
        $this->createdAt = $data['created_at'] ?? '';
    }

    // Getters
    public function getUserId(): int { return $this->userId; }
    public function getUsername(): string { return $this->username; }
    public function getEmail(): string { return $this->email; }
    public function getPasswordHash(): string { return $this->passwordHash; }
    public function getFirstName(): string { return $this->firstName; }
    public function getLastName(): string { return $this->lastName; }
    public function getTitle(): string { return $this->title; }
    public function isAdmin(): bool { return $this->isAdmin; }
    public function isActive(): bool { return $this->isActive; }
    public function getCreatedAt(): string { return $this->createdAt; }

    public function toArray(): array {
        return [
            "user_id" => $this->userId,
            "username" => $this->username,
            "email" => $this->email,
            "first_name" => $this->firstName,
            "last_name" => $this->lastName,
            "title" => $this->title,
            "is_admin" => $this->isAdmin,
            "is_active" => $this->isActive,
            "created_at" => $this->createdAt
        ];
    }
}
