<?php

// Database Configuration (Hardcoded for development)
define('DB_HOST', 'database');
define('DB_NAME', 'webshop');
define('DB_USER', 'root');
define('DB_PASS', 'tiger');

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/user.class.php';

class DbService {
    private PDO $pdo;

    public function __construct() {
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
    public function getUserById(int $id): ?User {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE user_id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ? new User($result) : null;
    }

    /**
     * Returns a User object or null
     */
    public function getUserByEmailOrUsername(string $identifier): ?User {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$identifier, $identifier]);
        $result = $stmt->fetch();
        return $result ? new User($result) : null;
    }

    /**
     * Creates a user and returns the new User ID (int)
     * The User object is created in AuthService after retrieval
     */
    public function createUser(array $data): int {
        $stmt = $this->pdo->prepare("
            INSERT INTO users (username, email, password_hash, first_name, last_name, title, is_admin, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 0, 1)
        ");
        $stmt->execute([
            $data['username'], $data['email'], $data['password_hash'],
            $data['first_name'], $data['last_name'], $data['title']
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    // ... keep updateUser, checkUniqueUser, transaction helpers exactly as they are ...
    // They operate on raw data/IDs, which is fine for DB layer.

    public function updateUser(int $userId, array $data): bool {
        // ... existing implementation ...
        $fields = [];
        $values = [];

        if (isset($data['first_name'])) { $fields[] = "first_name = ?"; $values[] = $data['first_name']; }
        if (isset($data['last_name'])) { $fields[] = "last_name = ?"; $values[] = $data['last_name']; }
        if (isset($data['title'])) { $fields[] = "title = ?"; $values[] = $data['title']; }
        if (isset($data['email'])) { $fields[] = "email = ?"; $values[] = $data['email']; }
        if (isset($data['username'])) { $fields[] = "username = ?"; $values[] = $data['username']; }
        if (isset($data['is_active'])) { $fields[] = "is_active = ?"; $values[] = (int)$data['is_active']; }

        if (empty($fields)) return true;

        $values[] = $userId;
        $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE user_id = ?";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($values);
    }

    public function checkUniqueUser(int $excludeId, string $username, string $email): bool {
        $stmt = $this->pdo->prepare("
            SELECT user_id FROM users 
            WHERE (username = ? OR email = ?) AND user_id != ?
        ");
        $stmt->execute([$username, $email, $excludeId]);
        return $stmt->fetch() !== false;
    }

    // --- Password Reset Queries ---
    public function setResetToken(int $userId, string $token, string $expires): bool {
        $stmt = $this->pdo->prepare("
            UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?
        ");
        return $stmt->execute([$token, $expires, $userId]);
    }

    public function getUserByToken(string $token): ?User {
        $stmt = $this->pdo->prepare("
            SELECT user_id FROM users 
            WHERE reset_token = ? AND reset_token_expires > NOW()
        ");
        $stmt->execute([$token]);
        $result = $stmt->fetch();
        // Note: This query only selects user_id. 
        // To return a full User object, we need the full row. 
        // Ideally, change query to SELECT *, but for now we'll handle the partial data.
        if (!$result) return null;
        
        // Since we only have user_id, we fetch the full user to create the object
        return $this->getUserById((int)$result['user_id']);
    }

    public function updatePassword(int $userId, string $hash): bool {
        $stmt = $this->pdo->prepare("
            UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?
        ");
        return $stmt->execute([$hash, $userId]);
    }

    // --- Transaction Helpers ---
    public function beginTransaction(): void { $this->pdo->beginTransaction(); }
    public function commit(): void { $this->pdo->commit(); }
    public function rollback(): void { $this->pdo->rollBack(); }
}
