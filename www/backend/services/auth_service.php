<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/db_service.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/user.class.php';

class AuthService {
    private DbService $db;

    public function __construct() {
        $this->db = new DbService();
    }

    public function register(array $data): array {
        // 1. Validation
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            return ["success" => false, "message" => "Missing required fields."];
        }
        if ($data['password'] !== $data['confirm_password']) {
            return ["success" => false, "message" => "Passwords do not match."];
        }
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return ["success" => false, "message" => "Invalid email format."];
        }

        // 2. Check Existence
        if ($this->db->getUserByEmailOrUsername($data['username'])) {
            return ["success" => false, "message" => "User already exists."];
        }

        // 3. Hash Password
        $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);

        try {
            $this->db->beginTransaction();
            $userId = $this->db->createUser($data);
            $this->db->commit();

            // Auto-login after registration
            $this->loginUser($userId);

            return ["success" => true, "message" => "Registration successful.", "user" => $this->db->getUserById($userId)];
        } catch (Exception $e) {
            $this->db->rollback();
            return ["success" => false, "message" => "Registration failed."];
        }
    }

    public function login(string $identifier, string $password, bool $rememberMe): array {
        $user = $this->db->getUserByEmailOrUsername($identifier);

        if (!$user || hash('sha256', $password) !== $user['password_hash']) {
            return ["success" => false, "message" => "Invalid credentials."];
        }

        $this->loginUser($user['user_id'], $rememberMe);
        
        return ["success" => true, "message" => "Login successful.", "user" => $user];
    }

    public function logout(): array {
        session_destroy();
        if (isset($_COOKIE['remember_me'])) {
            setcookie('remember_me', '', time() - 3600, '/');
        }
        return ["success" => true, "message" => "Logged out."];
    }

    public function requestPasswordReset(string $email): array {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ["success" => false, "message" => "Invalid email."];
        }

        $user = $this->db->getUserByEmailOrUsername($email);
        if (!$user) {
            // Security: Don't reveal if email exists
            return ["success" => true, "message" => "If the email exists, a reset link has been sent."];
        }

        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 3600);

        if ($this->db->setResetToken($user['user_id'], $token, $expires)) {
            // In real app: send email here
            $link = "http://localhost/frontend/sites/reset-password.html?token=" . $token;
            return ["success" => true, "message" => "Reset link generated.", "reset_link" => $link];
        }

        return ["success" => false, "message" => "Failed to generate reset token."];
    }

    public function resetPassword(string $token, string $newPassword): array {
        if (strlen($newPassword) < 6) {
            return ["success" => false, "message" => "Password too short."];
        }

        $user = $this->db->getUserByToken($token);
        if (!$user) {
            return ["success" => false, "message" => "Invalid or expired token."];
        }

        $hash = hash('sha256', $newPassword);
        if ($this->db->updatePassword($user['user_id'], $hash)) {
            return ["success" => true, "message" => "Password reset successful."];
        }

        return ["success" => false, "message" => "Failed to reset password."];
    }

    public function getUserData(int $userId): array {
        $user = $this->db->getUserById($userId);
        if (!$user) {
            return ["success" => false, "message" => "User not found."];
        }
        return ["success" => true, "user" => $user];
    }

    public function updateUserData(int $userId, array $data): array {
        // Validation
        if (empty($data['username']) || empty($data['email'])) {
            return ["success" => false, "message" => "Username and email required."];
        }
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return ["success" => false, "message" => "Invalid email."];
        }

        // Check uniqueness excluding self
        if ($this->db->checkUniqueUser($userId, $data['username'], $data['email'])) {
            return ["success" => false, "message" => "Username or email already taken."];
        }

        if ($this->db->updateUser($userId, $data)) {
            return ["success" => true, "message" => "Profile updated."];
        }

        return ["success" => false, "message" => "Update failed."];
    }

    // Helper to set session and cookie
    private function loginUser(int $userId, bool $rememberMe = false): void {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        
        $user = $this->db->getUserById($userId);
        $_SESSION['username'] = $user['username'];
        $_SESSION['is_admin'] = (bool)$user['is_admin'];

        if ($rememberMe) {
            $token = bin2hex(random_bytes(32));
            // Store token in DB for 'remember me' logic (omitted for brevity, usually requires a separate table)
            // For now, just set a generic cookie flag
            setcookie('remember_me', 'true', time() + (86400 * 30), "/");
        }
    }
}
