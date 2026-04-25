<?php

// Database Configuration (Hardcoded for development)
define('DB_HOST', 'database');
define('DB_NAME', 'webshop');
define('DB_USER', 'root');
define('DB_PASS', 'tiger');

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/user.class.php';

class DbService
{
    private PDO $pdo;

    public function __construct()
    {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ];

        try {
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            throw new Exception("Database connection failed.");
        }
    }

    // --- User Queries ---

    /**
     * Returns a User object or null
     */
    public function getUserById(int $id): ?User
    {
        $stmt = $this->pdo->prepare("SELECT *, fk_title_id AS title_id FROM users WHERE user_id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ? new User($result) : null;
    }

    /**
     * Returns a User object or null
     */
    public function getUserByEmailOrUsername(string $identifier): ?User
    {
        $stmt = $this->pdo->prepare("SELECT *, fk_title_id AS title_id FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$identifier, $identifier]);
        $result = $stmt->fetch();
        return $result ? new User($result) : null;
    }

    public function createUser(User $user): int
    {
        $stmt = $this->pdo->prepare("
        INSERT INTO users (username, email, password_hash, first_name, last_name, fk_title_id, is_admin, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 0, 1)
    ");
        $stmt->execute([
            $user->getUsername(),
            $user->getEmail(),
            $user->getPasswordHash(),
            $user->getFirstName(),
            $user->getLastName(),
            $user->getTitleId()
        ]);
        return (int) $this->pdo->lastInsertId();
    }

        /**
     * Creates a new address record using an Address object.
     * 
     * @param Address $address The address object containing the data.
     * @return int The new address_id.
     */
    public function createAddress(Address $address): int {
        $stmt = $this->pdo->prepare("
            INSERT INTO addresses (fk_user_id, postal_code, address, city, country)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $address->getFkUserId(),
            $address->getPostalCode(),
            $address->getAddress(),
            $address->getCity(),
            $address->getCountry()
        ]);

        return (int)$this->pdo->lastInsertId();
    }

    public function updateUser(User $user): bool
    {
        $stmt = $this->pdo->prepare("
        UPDATE users SET
            first_name = ?,
            last_name = ?,
            fk_title_id = ?,
            email = ?,
            username = ?,
            is_active = ?
        WHERE user_id = ?
    ");
        return $stmt->execute([
            $user->getFirstName(),
            $user->getLastName(),
            $user->getTitleId(),
            $user->getEmail(),
            $user->getUsername(),
            (int) $user->isActive(),
            $user->getUserId()
        ]);
    }

    public function checkUniqueUser(int $excludeId, string $username, string $email): bool
    {
        $stmt = $this->pdo->prepare("
            SELECT user_id FROM users 
            WHERE (username = ? OR email = ?) AND user_id != ?
        ");
        $stmt->execute([$username, $email, $excludeId]);
        return $stmt->fetch() !== false;
    }

    // --- Password Reset Queries ---
    public function setResetToken(int $userId, string $token, string $expires): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?
        ");
        return $stmt->execute([$token, $expires, $userId]);
    }

    public function getUserByToken(string $token): ?User
    {
        $stmt = $this->pdo->prepare("
            SELECT user_id FROM users 
            WHERE reset_token = ? AND reset_token_expires > NOW()
        ");
        $stmt->execute([$token]);
        $result = $stmt->fetch();
        // Note: This query only selects user_id. 
        // To return a full User object, we need the full row. 
        // Ideally, change query to SELECT *, but for now we'll handle the partial data.
        if (!$result)
            return null;

        // Since we only have user_id, we fetch the full user to create the object
        return $this->getUserById((int) $result['user_id']);
    }

    public function updatePassword(int $userId, string $hash): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?
        ");
        return $stmt->execute([$hash, $userId]);
    }

    // --- Transaction Helpers ---
    public function beginTransaction(): void
    {
        $this->pdo->beginTransaction();
    }
    public function commit(): void
    {
        $this->pdo->commit();
    }
    public function rollback(): void
    {
        $this->pdo->rollBack();
    }
}
