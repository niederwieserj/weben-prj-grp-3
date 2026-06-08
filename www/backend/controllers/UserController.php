<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/userService.php';

class UserController
{
    // Perform action using service and return result as array to be json encoded later
    public static function action(string $requestMethod, array $input, array $getParams, array $postParams): array
    {
        $userService = new UserService();
        $result = null;
        $action = $getParams['action'] ?? null;

        if ($requestMethod == 'GET') {
            switch ($action) {
                case 'getAllUsers':
                    if (!isset($_SESSION['user_id']) || empty($_SESSION['is_admin'])) {
                        throw new RuntimeException('Admin access required.');
                    }
                    
                    $result = $userService->getAllUsers();
                    break;

                default:
                    throw new InvalidArgumentException('Invalid action.');
            }
        }

        if ($requestMethod == 'POST') {
            switch ($action) {
                case 'sign-up':
                    $result = $userService->register($input);
                    break;

                case 'login':
                    $identifier = $input['identifier'] ?? '';
                    $password = $input['password'] ?? '';
                    $rememberMe = isset($input['remember-me']) && $input['remember-me'] === true;
                    $result = $userService->login($identifier, $password, $rememberMe);
                    break;

                case 'signout':
                    $userService->logout();
                    break;

                case 'getUserState':
                    if (isset($_SESSION['user_id'])) {
                        $result = [
                            "logged_in" => true,
                            "user_id" => $_SESSION['user_id'],
                            "is_admin" => $_SESSION['is_admin'] ?? false,
                            "username" => $_SESSION['username'] ?? null
                        ];
                    } else {
                        throw new RuntimeException('User not logged in.');
                    }
                    break;

                case 'getUserData':

                    $userId = $_SESSION['user_id'] ?? null;
                    if (!$userId) {
                        throw new RuntimeException('User not logged in.');
                    } else {
                        $result = $userService->getUserData($userId);
                    }
                    break;

                case 'updateUserData':
                    // Require authentication for updates
                    $userId = $_SESSION['user_id'] ?? null;
                    if (!$userId) {
                        throw new RuntimeException('User not logged in.');
                    } else {
                        $userService->updateUserData($userId, $input);
                        $result = [];
                    }
                    break;

                case 'updateUserDataById':
                    // Require authentication for updates
                    // TODO admin check
                    $userId = $input['user_id'] ?? null;
                    $userService->updateUserData($userId, $input);
                    $result = [];
                    break;

                case 'requestPasswordReset':
                    $email = $input['email'] ?? '';
                    $result = $userService->requestPasswordReset($email);
                    break;

                case 'resetPassword':
                    $token = $input['token'] ?? '';
                    $newPassword = $input['newPassword'] ?? '';
                    $userService->resetPassword($token, $newPassword);
                    break;

                default:
                    throw new InvalidArgumentException('Invalid action.');
            }
        }

        return $result ?? [];
    }
}
