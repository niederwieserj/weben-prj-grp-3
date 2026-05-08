<?php 
    // searchbar live search
    require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/services/db_service.php';
    header('Content-Type: application/json');

    if (isset($_POST['search'])) {
        try {
            $db = new DbService(); 

            $results = $db->searchProducts($_POST['search']);
            
            echo json_encode(['success' => true, 'data' => $results]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

?>