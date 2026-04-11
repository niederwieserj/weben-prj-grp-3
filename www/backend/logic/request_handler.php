<?php

require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? '';

switch ($action) {
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