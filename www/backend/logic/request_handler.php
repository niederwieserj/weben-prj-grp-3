<?php

require_once __DIR__ . '/auth.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/user.class.php';

session_start();

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? '';

switch ($action) {
    case 'login':
        echo json_encode(User::login($pdo, $data['identifier'], $data['password'], $data['remember-me']));
        break;

    case 'getUserState':
        echo json_encode([
            'logged_in' => isset($_SESSION['user_id']),
            'user_id' => $_SESSION['user_id'] ?? null,
            'is_admin' => $_SESSION['is_admin'] ?? false,
            'username' => $_SESSION['username'] ?? null
        ]);
        break;

    case 'signout':
        echo json_encode(User::logout($pdo));
        break;

    case 'getUserData':
        $userId = 1; // TODO: später durch Session ersetzen
        echo json_encode(getUserData($userId));
        break;

    case 'updateUserData':
        $userId = 1; // TODO: später durch Session ersetzen

        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $firstName = $data['first_name'] ?? '';
        $lastName = $data['last_name'] ?? '';
        $title = $data['title'] ?? '';

        echo json_encode(updateUserData(
            $userId,
            $username,
            $email,
            $firstName,
            $lastName,
            $title

        ));
        break;

    case 'requestPasswordReset':
        $email = $data['email'] ?? '';
        echo json_encode(requestPasswordReset($email));
        break;

    case 'resetPassword':
        $token = $data['token'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        echo json_encode(resetPassword($token, $newPassword));
        break;

    default:
        echo json_encode([
            "success" => false,
            "message" => "Invalid action."
        ]);
        break;
}