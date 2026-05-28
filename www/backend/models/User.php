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
    private int $title_id;
    private bool $isAdmin;
    private bool $isActive;
    private string $createdAt;

    public function __construct(array $data) {
        $this->userId = $data['user_id'] ?? 0;
        $this->username = $data['username'] ?? '';
        $this->email = $data['email'] ?? '';
        $this->passwordHash = $data['password_hash'] ?? '';
        $this->firstName = $data['firstName'] ?? '';
        $this->lastName = $data['lastName'] ?? '';
        $this->title_id = (int)$data['title_id'] ?? 1;
        $this->isAdmin = (bool)($data['is_admin'] ?? false);
        $this->isActive = (bool)($data['is_active'] ?? false);
        $this->createdAt = $data['created_at'] ?? '';
    }

    // Getters
    public function getUserId(): int { return $this->userId; }
    public function getUsername(): string { return $this->username; }
    public function getEmail(): string { return $this->email; }
    public function getPasswordHash(): string { return $this->passwordHash; }
    public function getFirstName(): string { return $this->firstName; }
    public function getLastName(): string { return $this->lastName; }
    public function getTitleId(): int { return $this->title_id; }
    public function isAdmin(): bool { return $this->isAdmin; }
    public function isActive(): bool { return $this->isActive; }
    public function getCreatedAt(): string { return $this->createdAt; }

    // Setters
    public function setUserId(int $userId): void { $this->userId = $userId; }
    public function setUsername(string $username): void { $this->username = $username; }
    public function setEmail(string $email): void { $this->email = $email; }
    public function setPasswordHash(string $passwordHash): void { $this->passwordHash = $passwordHash; }
    public function setFirstName(string $firstName): void { $this->firstName = $firstName; }
    public function setLastName(string $lastName): void { $this->lastName = $lastName; }
    public function setTitleId(int $title_id): void { $this->title_id = $title_id; }
    public function setIsAdmin(bool $isAdmin): void { $this->isAdmin = $isAdmin; }
    public function setIsActive(bool $isActive): void { $this->isActive = $isActive; }
    public function setCreatedAt(string $createdAt): void { $this->createdAt = $createdAt; }

    public function toArray(): array {
        return [
            "user_id" => $this->userId,
            "username" => $this->username,
            "email" => $this->email,
            "first_name" => $this->firstName,
            "last_name" => $this->lastName,
            "title_id" => $this->title_id,
            "is_admin" => $this->isAdmin,
            "is_active" => $this->isActive,
            "created_at" => $this->createdAt
        ];
    }
}
