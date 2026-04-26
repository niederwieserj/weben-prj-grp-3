<?php
// Start session immediately
session_start();

// Set JSON header
header('Content-Type: application/json');

// Include dependencies
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/auth_service.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/ProductService.php';

// Get Input
$input = json_decode(file_get_contents("php://input"), true);

// Instantiate Service
$authService = new AuthService();
$productService = new ProductService();

// Response array
$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $input['action'] ?? '';

    // Switch Case Router
    switch ($action) {
        case 'sign-up':
            $response = $authService->register($input);
            break;

        case 'login':
            $identifier = $input['identifier'] ?? '';
            $password = $input['password'] ?? '';
            $rememberMe = isset($input['remember-me']) && $input['remember-me'] === true;
            $response = $authService->login($identifier, $password, $rememberMe);
            break;

        case 'signout':
            $response = $authService->logout();
            break;

        case 'getUserState':
            // Now returns consistent format with other auth responses
            if (isset($_SESSION['user_id'])) {
                $response = [
                    "success" => true,
                    "logged_in" => true,
                    "user_id" => $_SESSION['user_id'],
                    "is_admin" => $_SESSION['is_admin'] ?? false,
                    "username" => $_SESSION['username'] ?? null
                ];
            } else {
                $response = [
                    "success" => true,
                    "logged_in" => false
                ];
            }
            break;

        case 'getUserData':
            // Properly use session user_id, fallback to null if not logged in
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                $response = [
                    "success" => false,
                    "message" => "Not authenticated"
                ];
            } else {
                $response = $authService->getUserData($userId);
            }
            break;

        case 'updateUserData':
            // Require authentication for updates
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                $response = [
                    "success" => false,
                    "message" => "Not authenticated"
                ];
            } else {
                $response = $authService->updateUserData($userId, $input);
            }
            break;

        case 'requestPasswordReset':
            $email = $input['email'] ?? '';
            $response = $authService->requestPasswordReset($email);
            break;

        case 'resetPassword':
            $token = $input['token'] ?? '';
            $newPassword = $input['newPassword'] ?? '';
            $response = $authService->resetPassword($token, $newPassword);
            break;

        default:
            $response = [
                "success" => false,
                "message" => "Invalid action requested."
            ];
            break;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'];

    // Switch Case Router
    switch ($action) {
        case 'getProduct':
            $product_id = (int)$_GET['product_id'] ?? 0;
            $response = $productService->getProduct($product_id);
            break;

        case 'getAllProducts':
            $response = $productService->getAllProducts();
            break;

        case 'getProductsWithImages':
            $response = $productService->getProductsWithImages();
            break;

        case 'getProductWithImages':
            $product_id = (int)$_GET['product_id'] ?? 0;
            $response = $productService->getProductByIdWithImages($product_id);
            break;

        case 'getRatingById':
            $product_id = (int)$_GET['product_id'] ?? 0;
            $response = $productService->getRatingById($product_id);
            break;

        default:
            $response = [
                "success" => false,
                "message" => "Invalid action requested."
            ];
            break;
    }
}


// Output JSON
$test = json_encode($response);
echo json_encode($response);
