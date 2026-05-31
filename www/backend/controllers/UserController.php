<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/AuthService.php';

class UserController
{
    // Perform action using service and return result as array to be json encoded later
    public static function action(string $requestMethod, array $input, array $getParams, array $postParams): array
    {
        $authService = new AuthService();
        $result = null;
        $action = $getParams['action'] ?? null;

        if ($requestMethod == 'GET') {
            switch ($action) {
                default:
                    throw new InvalidArgumentException('Invalid action.');
            }
        }

        if ($requestMethod == 'POST') {
            switch ($action) {
                case 'sign-up':
                    $result = $authService->register($input);
                    break;

                case 'login':
                    $identifier = $input['identifier'] ?? '';
                    $password = $input['password'] ?? '';
                    $rememberMe = isset($input['remember-me']) && $input['remember-me'] === true;
                    $result = $authService->login($identifier, $password, $rememberMe);
                    break;

                case 'signout':
                    $authService->logout();
                    break;

                case 'getUserState':
                    if (isset($_SESSION['user_id'])) {
                        $result = [
                            "success" => true,
                            "logged_in" => true,
                            "user_id" => $_SESSION['user_id'],
                            "is_admin" => $_SESSION['is_admin'] ?? false,
                            "username" => $_SESSION['username'] ?? null
                        ];
                    } else {
                        //throw new RuntimeException('User not logged in.');
                        $result = [
                            "success" => true,
                            "logged_in" => false
                        ];
                    }
                    break;

                case 'getUserData':
                    
                    $userId = $_SESSION['user_id'] ?? null;
                    if (!$userId) {
                        throw new RuntimeException('User not logged in.');
                    } else {
                        $result = $authService->getUserData($userId);
                    }
                    break;

                case 'updateUserData':
                    // Require authentication for updates
                    $userId = $_SESSION['user_id'] ?? null;
                    if (!$userId) {
                        throw new RuntimeException('User not logged in.');
                    } else {
                        $authService->updateUserData($userId, $input);
                        $result = ["success" => true];
                    }
                    break;

                case 'requestPasswordReset':
                    $email = $input['email'] ?? '';
                    $result = $authService->requestPasswordReset($email);
                    break;

                case 'resetPassword':
                    $token = $input['token'] ?? '';
                    $newPassword = $input['newPassword'] ?? '';
                    $authService->resetPassword($token, $newPassword);
                    break;

                default:
                    throw new InvalidArgumentException('Invalid action.');
            }
        }

        return $result ?? [];
    }
}
