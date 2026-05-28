<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/ProductService.php';

class ProductController
{
    // Perform action using service and return result as array to be json encoded later
    public static function action(string $requestMethod, array $input, array $getParams, array $postParams): array
    {
        $productService = new ProductService();
        $result = null;
        $action = $input['action'];

        if ($requestMethod == 'GET') {
            switch ($action) {
                case 'getCategories':
                    $result = $productService->getCategories();
                    break;

                case 'getProduct':
                    $product_id = (int) $getParams['product_id'] ?? 0;
                    $result = $productService->getProduct($product_id);
                    break;

                case 'getAllProducts':
                    $result = $productService->getAllProducts();
                    break;

                case 'getProductWithImages':
                    $product_id = (int) $getParams['product_id'] ?? 0;
                    $result = $productService->getProductByIdWithImages($product_id);
                    break;

                case 'getProductsWithImages':
                    $searchTerm = $getParams['search'] ?? null;
                    $result = $productService->getProductsWithImages($searchTerm);
                    break;

                case 'getRatingById':
                    $product_id = (int) $getParams['product_id'] ?? 0;
                    $result = $productService->getRatingById($product_id);
                    break;

                default:
                    throw new InvalidArgumentException('Invalid action.');
            }
        }

        if ($requestMethod == 'POST') {
            switch ($action) {
                case 'search':
                    $result = $productService->getProductByIdWithImages($postParams['search']);
                    break;

                default:
                    throw new InvalidArgumentException('Invalid action.');
            }
        }

        return $result;
    }
}
