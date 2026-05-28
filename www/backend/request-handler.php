<?php

session_start();
header('Content-Type: application/json');
$input = json_decode(file_get_contents("php://input"), true) ?? [];

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/controllers/ProductController.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/controllers/UserController.php';

$result = null;

try {
    switch ($_GET['controller'] ?? null) {
        case 'product':
            $result = ProductController::action($_SERVER['REQUEST_METHOD'], $input, $_GET, $_POST);
            break;

        case 'user':
            $result = UserController::action($_SERVER['REQUEST_METHOD'], $input, $_GET, $_POST);
            break;

        default:
            throw new InvalidArgumentException('Invalid controller.');
    }
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    $result['message'] = $e->getMessage();
} catch (OutOfBoundsException $e) {
    http_response_code(404);
    $result['message'] = $e->getMessage();
} catch (Exception $e) {
    http_response_code(500);
    $result['message'] = $e->getMessage();
} catch (Error $e) {
    http_response_code(500);
    $result['message'] = $e->getMessage();
}

echo json_encode($result);
