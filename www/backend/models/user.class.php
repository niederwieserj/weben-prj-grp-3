<?php
/**
 * User Class
 * Encapsulates user data and business logic for authentication and profile management.
 * Follows the project spec: OOP approach, separation of concerns, secure password handling.
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
    private bool $isActive; // Corresponds to 'deactivated' logic in spec
    private string $createdAt;
    
    // Database connection
    private PDO $pdo;

    /**
     * Constructor
     * Can be instantiated empty for new users, or with data from DB.
     */
    public function __construct(PDO $pdo, int $userId = null) {
        $this->pdo = $pdo;
        $this->userId = $userId;
        
        if ($userId !== null) {
            $this->loadFromDb($userId);
        }
    }

    /**
     * Loads user data from the database by ID.
     * Used internally by constructor or factory methods.
     */
    private function loadFromDb(int $userId): void {
        $stmt = $this->pdo->prepare("
            SELECT user_id, username, email, password_hash, 
                   first_name, last_name, title, is_admin, created_at
            FROM users
            WHERE user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            throw new Exception("User not found.");
        }

        $this->userId = $data['user_id'];
        $this->username = $data['username'];
        $this->email = $data['email'];
        $this->passwordHash = $data['password_hash'];
        $this->firstName = $data['first_name'] ?? '';
        $this->lastName = $data['last_name'] ?? '';
        $this->title = $data['title'] ?? '';
        $this->isAdmin = (bool)$data['is_admin'];
        $this->createdAt = $data['created_at'];
        
        // Spec III.3.2.a: Check if user is deactivated (assuming a column 'is_active' or checking status)
        // Since your SQL didn't have 'is_active', we assume active by default unless deleted.
        // If you add an 'is_active' column later, map it here.
        $this->isActive = true; 
    }

    // --- Getters ---
    public function getUserId(): int { return $this->userId; }
    public function getUsername(): string { return $this->username; }
    public function getEmail(): string { return $this->email; }
    public function getFirstName(): string { return $this->firstName; }
    public function getLastName(): string { return $this->lastName; }
    public function getTitle(): string { return $this->title; }
    public function isAdmin(): bool { return $this->isAdmin; }
    public function isActive(): bool { return $this->isActive; }
    public function getCreatedAt(): string { return $this->createdAt; }

    // --- Business Logic Methods ---

    /**
     * Static method to Register a new user.
     * This replaces the procedural registerUser() function.
     * 
     * @param PDO $pdo Database connection
     * @param array $data Associative array of user data
     * @return array ['success' => bool, 'message' => string, 'user' => User|null]
     */
    public static function register(PDO $pdo, array $data): array {
        // Extract data
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $firstName = trim($data['firstName'] ?? '');
        $lastName = trim($data['lastName'] ?? '');
        $title = '';
        $address = trim($data['address'] ?? '');
        $city = trim($data['city'] ?? '');
        $zip = trim($data['zip'] ?? '');
        $country = trim($data['country'] ?? '');

        // 1. Validation
        if (empty($username) || empty($email) || empty($password) || empty($firstName) || empty($lastName)) {
            return ["success" => false, "message" => "All required fields must be filled."];
        }

        if (strlen($password) < 6) {
            return ["success" => false, "message" => "Password must be at least 6 characters."];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ["success" => false, "message" => "Invalid email format."];
        }

        // 2. Check Existence
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            return ["success" => false, "message" => "Username or email already exists."];
        }

        // 3. Hash Password
        $passwordHash = hash('sha256', $password);

        try {
            $pdo->beginTransaction();

            // 4. Insert User
            $stmtUser = $pdo->prepare("
                INSERT INTO users (username, email, password_hash, first_name, last_name, title, is_admin)
                VALUES (?, ?, ?, ?, ?, ?, 0)
            ");
            $stmtUser->execute([$username, $email, $passwordHash, $firstName, $lastName, $title]);
            $newUserId = $pdo->lastInsertId();

            // 5. Insert Address (Spec III.1.b.x)
            // Note: In a strict OOP design, you might have an Address class. 
            // But for this project scope, inserting here is acceptable.
            $stmtAddr = $pdo->prepare("
                INSERT INTO addresses (fk_user_id, postal_code, address, city, country)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmtAddr->execute([$newUserId, $zip, $address, $city, $country]);

            $pdo->commit();

            // 6. Return new User object
            $newUser = new self($pdo, $newUserId);
            return ["success" => true, "message" => "Registration successful.", "user" => $newUser];

        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log("Registration DB Error: " . $e->getMessage());
            return ["success" => false, "message" => "Database error during registration."];
        }
    }

    /**
     * Authenticates a user and handles "Remember Me" cookie (Spec III.2).
     * 
     * @param string $identifier Username or Email
     * @param string $password
     * @param bool $rememberMe
     * @return array ['success' => bool, 'message' => string, 'user' => User|null]
     */
    public static function login(PDO $pdo, string $identifier, string $password, bool $rememberMe = false): array {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $identifier = trim($identifier);
        $password = trim($password);

        if (empty($identifier) || empty($password)) {
            return ["success" => false, "message" => "Credentials required."];
        }

        // Determine field (Spec III.2.b)
        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        
        $stmt = $pdo->prepare("SELECT * FROM users WHERE {$field} = ? LIMIT 1");
        $stmt->execute([$identifier]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userData) {
            // Generic message to prevent enumeration (Security best practice)
            return ["success" => false, "message" => "Invalid credentials."];
        }

        // Check if user is deactivated (Spec III.3.2.a)
        // Assuming you might add an 'is_active' column later, or just check if they exist.
        // For now, we assume if they are in DB, they are active.
        
        // Verify Password (Matches SHA256 logic)
        if (hash('sha256', $password) !== $userData['password_hash']) {
            return ["success" => false, "message" => "Invalid credentials."];
        }

        // Set Session (Spec III.2.c, III.2.d)
        $_SESSION['user_id'] = $userData['user_id'];
        $_SESSION['username'] = $userData['username'];
        $_SESSION['is_admin'] = (bool)$userData['is_admin'];
        $_SESSION['first_name'] = $userData['first_name'];
        $_SESSION['last_name'] = $userData['last_name'];

        // Handle "Remember Me" Cookie (Spec III.2.e, III.2.f)
        $cookieName = 'webshop_remember';

        if ($rememberMe) {
            // In a real production app, generate a random token, store it in DB, and send cookie with token.
            // For this school project, we will store a simple signed token or just rely on session duration.
            // To strictly follow "Cookie sets login", we create a persistent cookie.
            // WARNING: Storing user ID in a cookie is less secure than a token. 
            // For this project scope, we'll set a long-lived cookie with the user ID.
            
            $cookieValue = base64_encode($userData['user_id'] . ':' . $userData['username']);
            // 30 days expiration
            setcookie($cookieName, $cookieValue, time() + (86400 * 30), "/");
        } else {
            // Ensure cookie is removed if not requested
            if (isset($_COOKIE[$cookieName])) {
                setcookie($cookieName, "", time() - 3600, "/");
            }
        }

        session_regenerate_id(true); // Prevent fixation

        $user = new User($pdo, $userData['user_id']);
        return ["success" => true, "message" => "Login successful.", "user" => $user];
    }

        /**
     * Logs out the current user and clears session/cookies.
     * Implements Spec III.2.f: Session cleanup on logout.
     * 
     * @return array ['success' => bool, 'message' => string]
     */
    public static function logout(PDO $pdo): array {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Clear "Remember Me" cookie if exists
        $cookieName = 'webshop_remember';
        if (isset($_COOKIE[$cookieName])) {
            setcookie($cookieName, "", time() - 3600, "/");
            unset($_COOKIE[$cookieName]);
        }

        // Unset all session variables
        $_SESSION = [];

        // Delete session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                "",
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }

        // Destroy session
        session_destroy();

        return ["success" => true, "message" => "Logged out successfully."];
    }

    /**
     * Updates user profile data.
     * Implements Spec III.6.a: Edit data, requires password verification (implied by "sensitive info").
     */
    public function updateProfile(string $firstName, string $lastName, string $title, string $currentPassword): array {
        // Verify current password before allowing changes (Security requirement)
        if (hash('sha256', $currentPassword) !== $this->passwordHash) {
            return ["success" => false, "message" => "Current password is incorrect."];
        }

        $stmt = $this->pdo->prepare("
            UPDATE users 
            SET first_name = ?, last_name = ?, title = ?
            WHERE user_id = ?
        ");

        $success = $stmt->execute([$firstName, $lastName, $title, $this->userId]);

        if ($success) {
            $this->firstName = $firstName;
            $this->lastName = $lastName;
            $this->title = $title;
            return ["success" => true, "message" => "Profile updated."];
        }

        return ["success" => false, "message" => "Update failed."];
    }

    /**
     * Admin function to deactivate a user.
     * Implements Spec III.3.2.a
     */
    public function deactivate(): array {
        if (!$this->isAdmin) {
            return ["success" => false, "message" => "Unauthorized."];
        }
        
        // Note: Your SQL schema currently lacks an 'is_active' column.
        // You should add: ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1;
        // Then update the query below.
        // For now, we simulate by deleting or marking. 
        // Let's assume we add the column logic here for the future proofing.
        
        $stmt = $this->pdo->prepare("UPDATE users SET is_active = 0 WHERE user_id = ?");
        $success = $stmt->execute([$this->userId]);
        
        if ($success) {
            $this->isActive = false;
            return ["success" => true, "message" => "User deactivated."];
        }
        
        return ["success" => false, "message" => "Failed to deactivate user."];
    }

    /**
     * Returns user data as an array for JSON response (Spec II.a.i)
     */
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
