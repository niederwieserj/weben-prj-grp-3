<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/db_service.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/user.class.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/address.class.php';

class AuthService
{
    private DbService $db;

    public function __construct()
    {
        $this->db = new DbService();
    }

    public function register(array $data): array
    {
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

        // 2. Check Existence (Now returns User object or null)
        if ($this->db->getUserByEmailOrUsername($data['username'])) {
            return ["success" => false, "message" => "User already exists."];
        }

        // 3. Hash Password
        $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);

        try {
            $this->db->beginTransaction();
            $userId = $this->db->createUser(new User($data));

            $address = new Address($data);
            $address->setFkUserId($userId);

            $this->db->createAddress($address);

            // Retrieve the newly created User object
            $newUser = $this->db->getUserById($userId);

            $this->db->commit();

            // Auto-login after registration
            $this->loginUser($newUser);

            // Return the User object converted to array for JSON response
            return ["success" => true, "message" => "Registration successful.", "user" => $newUser->toArray()];
        } catch (Exception $e) {
            $this->db->rollback();
            // Log error internally if possible
            return ["success" => false, "message" => "Registration failed."];
        }
    }

    public function login(string $identifier, string $password, bool $rememberMe): array
    {
        // Get User object
        $user = $this->db->getUserByEmailOrUsername($identifier);

        if (!$user) {
            return ["success" => false, "message" => "Invalid credentials."];
        }

        if (!$user->isActive()) {
            return ['success' => false, 'message' => 'Account is deactivated. Contact support.'];
        }

        // Verify password using the User object's hash
        if (password_verify($password, $user->getPasswordHash())) {
            $this->loginUser($user, $rememberMe);
            return ["success" => true, "message" => "Login successful.", "user" => $user->toArray()];
        }

        return ["success" => false, "message" => "Invalid credentials."];
    }

    public function logout(): array
    {
        session_destroy();
        if (isset($_COOKIE['remember_me'])) {
            setcookie('remember_me', '', time() - 3600, '/');
        }
        return ["success" => true, "message" => "Logged out."];
    }

    public function requestPasswordReset(string $email): array
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ["success" => false, "message" => "Invalid email."];
        }

        $user = $this->db->getUserByEmailOrUsername($email);
        if (!$user) {
            return ["success" => true, "message" => "If the email exists, a reset link has been sent."];
        }

        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 3600);

        if ($this->db->setResetToken($user->getUserId(), $token, $expires)) {
            $link = "http://localhost/frontend/sites/reset-password.html?token=" . $token;
            return ["success" => true, "message" => "Reset link generated.", "reset_link" => $link];
        }

        return ["success" => false, "message" => "Failed to generate reset token."];
    }

    public function resetPassword(string $token, string $newPassword): array
    {
        if (strlen($newPassword) < 6) {
            return ["success" => false, "message" => "Password too short."];
        }

        $user = $this->db->getUserByToken($token);
        if (!$user) {
            return ["success" => false, "message" => "Invalid or expired token."];
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT); // Switched to password_hash for consistency
        if ($this->db->updatePassword($user->getUserId(), $hash)) {
            return ["success" => true, "message" => "Password reset successful."];
        }

        return ["success" => false, "message" => "Failed to reset password."];
    }

    public function getUserData(int $userId): array
    {
        $user = $this->db->getUserById($userId);
        if (!$user) {
            return ["success" => false, "message" => "User not found."];
        }
        return ["success" => true, "user" => $user->toArray()];
    }

    public function updateUserData(int $userId, array $input): array
    {
        $user = $this->db->getUserById($userId);
        if (!$user) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        // Apply only the fields that were submitted
        if (isset($input['first_name']))
            $user->setFirstName($input['first_name']);
        if (isset($input['last_name']))
            $user->setLastName($input['last_name']);
        if (isset($input['title']))
            $user->setTitleId((int) $input['title']);
        if (isset($input['email']))
            $user->setEmail($input['email']);
        if (isset($input['username']))
            $user->setUsername($input['username']);

        $success = $this->db->updateUser($user);
        return ['success' => true, 'message' => 'User updated.'];
    }
    // Helper to set session and cookie
    private function loginUser(User $user, bool $rememberMe = false): void
    {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user->getUserId();
        $_SESSION['username'] = $user->getUsername();
        $_SESSION['is_admin'] = $user->isAdmin();

        if ($rememberMe) {
            $token = bin2hex(random_bytes(32));
            // In a real app, store this token in a 'remember_tokens' table linked to user_id
            setcookie('remember_me', 'true', time() + (86400 * 30), "/");
        }
    }
}
