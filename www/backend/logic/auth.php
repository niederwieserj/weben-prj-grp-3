<?php

require_once __DIR__ . '/../config/db_access.php';

function getUserData(int $userId): array
{
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT user_id, username, email, first_name, last_name, title
        FROM users
        WHERE user_id = ?
        LIMIT 1
    ");
    $stmt->execute([$userId]);

    $user = $stmt->fetch();

    if (!$user) {
        return [
            "success" => false,
            "message" => "User not found."
        ];
    }

    return [
        "success" => true,
        "user" => $user
    ];
}

function updateUserData(
    int $userId,
    string $username,
    string $email,
    string $firstName,
    string $lastName,
    string $title
): array {
    global $pdo;

    $username = trim($username);
    $email = trim($email);
    $firstName = trim($firstName);
    $lastName = trim($lastName);
    $title = trim($title);

    if ($username === '' || $email === '') {
        return [
            "success" => false,
            "message" => "Username and email are required."
        ];
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return [
            "success" => false,
            "message" => "Invalid email format."
        ];
    }

    $checkStmt = $pdo->prepare("
        SELECT user_id
        FROM users
        WHERE (username = ? OR email = ?)
          AND user_id != ?
        LIMIT 1
    ");
    $checkStmt->execute([$username, $email, $userId]);

    if ($checkStmt->fetch()) {
        return [
            "success" => false,
            "message" => "Username or email is already in use."
        ];
    }

    $stmt = $pdo->prepare("
        UPDATE users
        SET username = ?,
            email = ?,
            first_name = ?,
            last_name = ?,
            title = ?
        WHERE user_id = ?
    ");

    $ok = $stmt->execute([
        $username,
        $email,
        $firstName,
        $lastName,
        $title,
        $userId
    ]);

    return [
        "success" => $ok,
        "message" => $ok ? "User data updated successfully." : "Update failed."
    ];
}

function requestPasswordReset(string $email): array
{
    global $pdo;

    $email = trim($email);

    if ($email === '') {
        return [
            "success" => false,
            "message" => "Email is required."
        ];
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return [
            "success" => false,
            "message" => "Invalid email format."
        ];
    }

    $stmt = $pdo->prepare("
        SELECT user_id, email
        FROM users
        WHERE email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);

    $user = $stmt->fetch();

    if (!$user) {
        return [
            "success" => false,
            "message" => "No user found with this email."
        ];
    }

    $token = bin2hex(random_bytes(32));

    $updateStmt = $pdo->prepare("
        UPDATE users
        SET reset_token = ?,
            reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR)
        WHERE user_id = ?
    ");

    $ok = $updateStmt->execute([$token, $user['user_id']]);

    if (!$ok) {
        return [
            "success" => false,
            "message" => "Failed to create reset token."
        ];
    }

    return [
        "success" => true,
        "message" => "Password reset link created.",
        "reset_link" => "http://localhost/frontend/sites/reset-password.html?token=" . $token
    ];
}

function resetPassword(string $token, string $newPassword): array
{
    global $pdo;

    $token = trim($token);
    $newPassword = trim($newPassword);

    if ($token === '' || $newPassword === '') {
        return [
            "success" => false,
            "message" => "Token and new password are required."
        ];
    }

    if (strlen($newPassword) < 6) {
        return [
            "success" => false,
            "message" => "Password must be at least 6 characters long."
        ];
    }

    $stmt = $pdo->prepare("
        SELECT user_id
        FROM users
        WHERE reset_token = ?
          AND reset_token_expires > NOW()
        LIMIT 1
    ");
    $stmt->execute([$token]);

    $user = $stmt->fetch();

    if (!$user) {
        return [
            "success" => false,
            "message" => "Invalid or expired reset token."
        ];
    }

    $updateStmt = $pdo->prepare("
        UPDATE users
        SET password_hash = SHA2(?, 256),
            reset_token = NULL,
            reset_token_expires = NULL
        WHERE user_id = ?
    ");

    $ok = $updateStmt->execute([$newPassword, $user['user_id']]);

    return [
        "success" => $ok,
        "message" => $ok ? "Password has been reset successfully." : "Failed to reset password."
    ];
}
