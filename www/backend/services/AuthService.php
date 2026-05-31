<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/DbService.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/Address.php';

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
            throw new InvalidArgumentException("Missing required fields.");
        }

        if ($data['password'] !== $data['confirm_password']) {
            throw new InvalidArgumentException("Passwords do not match.");
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Invalid email format.");
        }

        // 2. Check Existence (Now returns User object or null)
        if ($this->db->getUserByEmailOrUsername($data['username'])) {
            throw new InvalidArgumentException("Username already exists.");
        }

        if ($this->db->getUserByEmailOrUsername($data['email'])) {
            throw new InvalidArgumentException("Email already exists.");
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
            return ["user" => $newUser->toArray()];
        } catch (Exception $e) {
            $this->db->rollback();

            throw new RuntimeException("Registration failed.");
        }
    }

    public function login(string $identifier, string $password, bool $rememberMe): array
    {
        // Get User object
        $user = $this->db->getUserByEmailOrUsername($identifier);

        if (!$user) {
            throw new InvalidArgumentException("Invalid user.");
        }

        if (!$user->isActive()) {
            throw new RuntimeException('Account is deactivated.');
        }

        // Verify password using the User object's hash
        if (password_verify($password, $user->getPasswordHash())) {
            $this->loginUser($user, $rememberMe);
            return ["user" => $user->toArray()];
        }

        throw new InvalidArgumentException("Invalid credentials.");
    }

    public function logout(): void
    {
        session_destroy();
        if (isset($_COOKIE['remember_me'])) {
            setcookie('remember_me', '', time() - 3600, '/');
        }
    }

    public function requestPasswordReset(string $email): array
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Invalid email.");
        }

        $user = $this->db->getUserByEmailOrUsername($email);
        if (!$user) {
            throw new InvalidArgumentException("Invalid user.");
        }

        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 3600);

        if ($this->db->setResetToken($user->getUserId(), $token, $expires)) {
            $link = "http://localhost/frontend/sites/reset-password.html?token=" . $token;
            return ["reset_link" => $link];
        }

        throw new RuntimeException("Failed to generate reset token.");
    }

    public function resetPassword(string $token, string $newPassword): void
    {
        if (strlen($newPassword) < 6) {
            throw new InvalidArgumentException("Password too short.");
        }

        $user = $this->db->getUserByToken($token);
        if (!$user) {
            throw new InvalidArgumentException("Invalid or expired token.");
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT); // Switched to password_hash for consistency
        
        $this->db->updatePassword($user->getUserId(), $hash);
    }

    public function getUserData(int $userId): array
    {
        $user = $this->db->getUserById($userId);
        
        if (!$user) {
            throw new InvalidArgumentException("User not found.");
        }

        return ["user" => $user->toArray()];
    }

    public function updateUserData(int $userId, array $input): void
    {
        $user = $this->db->getUserById($userId);

        if (!$user) {
            throw new InvalidArgumentException("User not found.");
        }

        // Apply only the fields that were submitted
        if (isset($input['first_name']))
            $user->setFirstName($input['first_name']);
        if (isset($input['last_name']))
            $user->setLastName($input['last_name']);
        if (isset($input['title']))
            $titleId = ($input['title'] !== '') ? (int) $input['title'] : null;
            $user->setTitleId($titleId);
        if (isset($input['email']))
            $user->setEmail($input['email']);
        if (isset($input['username']))
            $user->setUsername($input['username']);

        $this->db->updateUser($user);
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
