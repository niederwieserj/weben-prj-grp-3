<?php

// Database Configuration (Hardcoded for development)
define('DB_HOST', 'database');
define('DB_NAME', 'webshop');
define('DB_USER', 'root');
define('DB_PASS', 'tiger');

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/Product.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/ProductRating.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/ProductImage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/Category.php';

class DbService
{
    private PDO $pdo;

    public function __construct()
    {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ];

        try {
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            throw new Exception("Database connection failed.");
        }
    }

    // --- Category Queries
    public function getCategories(): array
    {
        $stmt = $this->pdo->query("SELECT category_id, name FROM categories ORDER BY name ASC");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $categories = [];
        foreach ($results as $row) {
            $categories[] = new Category($row);
        }

        return $categories;
    }

    // --- Rating Queries
    /**
     * Returns a single Product object or null.
     */
    public function getRatingById(int $id): ?ProductRating
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM product_ratings WHERE product_id = ?"
        );
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ? new ProductRating($result) : null;
    }

    // --- Product Queries

    /**
     * Returns a single Product object or null.
     */
    public function getProductById(int $id): ?Product
    {
        $stmt = $this->pdo->prepare(
            "SELECT *, fk_category_id AS category_id FROM products WHERE product_id = ?"
        );
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ? new Product($result) : null;
    }

    /**
     * Fetches all products with their associated images.
     * Returns an array of arrays: [ [Product, Image[]], ... ]
     * 
     * Note: We do NOT modify the Product, or Image classes.
     */
    public function getAllProductsWithImages(?string $searchTerm = null): array
    {
        // 1. The SQL Query
        // We join ratings and images. 
        // We use DISTINCT to avoid duplicates if a product has multiple images/ratings 
        // causing a Cartesian product explosion, OR we handle the grouping in PHP.
        // Here, we fetch raw data and group in PHP for maximum flexibility.

        // if product search POST, dann ein modfiziertes query

        $sql = "
            SELECT 
                *
            FROM products p
            LEFT JOIN product_images i ON p.product_id = i.fk_product_id
        ";

        if ($searchTerm) {
            $sql .= " WHERE p.name LIKE ?";
        }

        $sql .= " ORDER BY p.product_id ASC";

        $stmt = $this->pdo->prepare($sql);

        if ($searchTerm) {
            $stmt->execute(["%$searchTerm%"]);
        } else {
            $stmt->execute();
        }
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) {
            return [];
        }

        // 2. Grouping Logic
        $groupedProducts = [];

        foreach ($rows as $row) {
            $pid = $row['product_id'];

            // Initialize the product entry if it doesn't exist yet
            if (!isset($groupedProducts[$pid])) {
                // Instantiate the Product class (unchanged)
                $productObj = new Product($row);

                // Initialize the container for this product
                $groupedProducts[$pid] = [
                    'product' => $productObj,
                    'images' => []
                ];
            }

            // 4. Attach Images
            if (!empty($row['image_id'])) {
                $groupedProducts[$pid]['images'][] = new ProductImage($row);
            }
        }

        // 5. Return as a numerically indexed array (optional, for cleaner consumption)
        return array_values($groupedProducts);
    }

    public function createProduct(array $data): int
    {
        $stmt = $this->pdo->prepare("
        INSERT INTO products 
            (name, description, price, stock_quantity, fk_category_id)
        VALUES 
            (?, ?, ?, ?, ?)
    ");

        $stmt->execute([
            $data['name'],
            $data['description'],
            $data['price'],
            $data['stock_quantity'],
            $data['fk_category_id']
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function updateProduct(int $productId, array $data): bool
    {
        $stmt = $this->pdo->prepare("
        UPDATE products SET
            name = ?,
            description = ?,
            price = ?,
            stock_quantity = ?,
            fk_category_id = ?
        WHERE product_id = ?
    ");

        $stmt->execute([
            $data['name'],
            $data['description'],
            $data['price'],
            $data['stock_quantity'],
            $data['fk_category_id'],
            $productId
        ]);

        return $stmt->rowCount() > 0;
    }

    public function createProductImage(int $productId, string $imageUrl, string $altText): int
    {
        $stmt = $this->pdo->prepare("
        INSERT INTO product_images 
            (fk_product_id, image_url, alt_text, sort_order, is_primary)
        VALUES 
            (?, ?, ?, 0, 1)
    ");

        $stmt->execute([
            $productId,
            $imageUrl,
            $altText
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function upsertPrimaryProductImage(int $productId, string $imageUrl, string $altText): void
    {
        $stmt = $this->pdo->prepare("
        SELECT image_id 
        FROM product_images 
        WHERE fk_product_id = ? AND is_primary = 1
        LIMIT 1
    ");
        $stmt->execute([$productId]);
        $existingImage = $stmt->fetch();

        if ($existingImage) {
            $updateStmt = $this->pdo->prepare("
            UPDATE product_images SET
                image_url = ?,
                alt_text = ?
            WHERE image_id = ?
        ");

            $updateStmt->execute([
                $imageUrl,
                $altText,
                $existingImage['image_id']
            ]);
        } else {
            $this->createProductImage($productId, $imageUrl, $altText);
        }
    }


    /**
     * Fetches a single product by ID along with all its associated images.
     * 
     * @param int $productId The ID of the product to fetch.
     * @return array|null Returns an associative array with 'product' (Product object) and 'images' (array of ProductImage objects), or null if not found.
     */
    public function getProductByIdWithImages(int $productId): ?array
    {
        // 1. The SQL Query
        // We filter by product_id immediately to avoid fetching unnecessary data.
        // We still join images to handle the 1:N relationship.
        $sql = "
        SELECT 
            *
        FROM products p
        LEFT JOIN product_images i ON p.product_id = i.fk_product_id
        WHERE p.product_id = ?
    ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$productId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) {
            return null;
        }

        // 2. Grouping Logic
        // Even though we filtered by ID, we might get multiple rows if there are multiple images.
        // We reuse the grouping logic from getAllProductsWithImages to ensure consistency.

        $groupedProducts = [];

        foreach ($rows as $row) {
            $pid = $row['product_id'];

            // Initialize the product entry if it doesn't exist yet
            if (!isset($groupedProducts[$pid])) {
                // Instantiate the Product class
                $productObj = new Product($row);

                $groupedProducts[$pid] = [
                    'product' => $productObj,
                    'images' => []
                ];
            }

            // Attach Images if they exist
            if (!empty($row['image_id'])) {
                $groupedProducts[$pid]['images'][] = new ProductImage($row);
            }
        }

        // Since we queried for a specific ID, the array should contain exactly one entry.
        // We return that single entry directly.
        return array_values($groupedProducts)[0] ?? null;
    }

    /**
     * Returns an array of Product objects.
     *
     * @return Product[]
     */
    public function getAllProducts(): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT *, fk_category_id AS category_id FROM products ORDER BY created_at DESC"
        );
        $stmt->execute();
        $results = $stmt->fetchAll();

        $products = [];
        foreach ($results as $row) {
            $products[] = new Product($row);
        }

        return $products;
    }

    // --- User Queries ---

    /**
     * Returns a User object or null
     */
    public function getUserById(int $id): ?User
    {
        $stmt = $this->pdo->prepare("SELECT *, fk_title_id AS title_id FROM users WHERE user_id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ? new User($result) : null;
    }

    /**
     * Returns a User object or null
     */
    public function getUserByEmailOrUsername(string $identifier): ?User
    {
        $stmt = $this->pdo->prepare("SELECT *, fk_title_id AS title_id FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$identifier, $identifier]);
        $result = $stmt->fetch();
        return $result ? new User($result) : null;
    }

    public function createUser(User $user): int
    {
        $stmt = $this->pdo->prepare("
        INSERT INTO users (username, email, password_hash, first_name, last_name, fk_title_id, is_admin, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 0, 1)
    ");
        $stmt->execute([
            $user->getUsername(),
            $user->getEmail(),
            $user->getPasswordHash(),
            $user->getFirstName(),
            $user->getLastName(),
            $user->getTitleId()
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Creates a new address record using an Address object.
     * 
     * @param Address $address The address object containing the data.
     * @return int The new address_id.
     */
    public function createAddress(Address $address): int
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO addresses (fk_user_id, postal_code, address, city, country)
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $address->getFkUserId(),
            $address->getPostalCode(),
            $address->getAddress(),
            $address->getCity(),
            $address->getCountry()
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function updateUser(User $user): bool
    {
        $stmt = $this->pdo->prepare("
        UPDATE users SET
            first_name = ?,
            last_name = ?,
            fk_title_id = ?,
            email = ?,
            username = ?,
            is_active = ?
        WHERE user_id = ?
    ");
        return $stmt->execute([
            $user->getFirstName(),
            $user->getLastName(),
            $user->getTitleId(),
            $user->getEmail(),
            $user->getUsername(),
            (int) $user->isActive(),
            $user->getUserId()
        ]);
    }

    public function checkUniqueUser(int $excludeId, string $username, string $email): bool
    {
        $stmt = $this->pdo->prepare("
            SELECT user_id FROM users 
            WHERE (username = ? OR email = ?) AND user_id != ?
        ");
        $stmt->execute([$username, $email, $excludeId]);
        return $stmt->fetch() !== false;
    }

    // --- Password Reset Queries ---
    public function setResetToken(int $userId, string $token, string $expires): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?
        ");
        return $stmt->execute([$token, $expires, $userId]);
    }

    public function getUserByToken(string $token): ?User
    {
        $stmt = $this->pdo->prepare("
            SELECT user_id FROM users 
            WHERE reset_token = ? AND reset_token_expires > NOW()
        ");
        $stmt->execute([$token]);
        $result = $stmt->fetch();

        if (!$result)
            return null;

        // fetch full user to create object
        return $this->getUserById((int) $result['user_id']);
    }

    public function updatePassword(int $userId, string $hash): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?
        ");
        return $stmt->execute([$hash, $userId]);
    }

    // --- Transaction Helpers ---
    public function beginTransaction(): void
    {
        $this->pdo->beginTransaction();
    }
    public function commit(): void
    {
        $this->pdo->commit();
    }
    public function rollback(): void
    {
        $this->pdo->rollBack();
    }



    
    // ***********************************
    // searchbar live product search query
    // ***********************************
    public function searchProducts(string $search): array
    {
        $stmt = $this->pdo->prepare("SELECT name, product_id 
                                    FROM products 
                                    WHERE name 
                                    LIKE ?");
        $stmt->execute(["%$search%"]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // **********************************
    // ********** Cart Queries **********
    // **********************************
    public function getCartItems(int $userId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                p.product_id AS id,
                p.name,
                p.price,
                i.image_url AS imageUrl,
                c.quantity
            FROM cartItems c
            JOIN products p ON c.fk_product_id = p.product_id
            LEFT JOIN product_images i ON p.product_id = i.fk_product_id AND i.is_primary = 1
            WHERE c.fk_user_id = ?
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addCartItem(int $userId, int $productId): void
    {
        // first check if item already exists in users cart
        $stmt = $this->pdo->prepare("SELECT quantity FROM cartItems WHERE fk_user_id = ? AND fk_product_id = ?");
        $stmt->execute([$userId, $productId]);
        $row = $stmt->fetch();

        if ($row) {
            $this->increaseCartItemQuantity($userId, $productId);
        } else {
            $stmt = $this->pdo->prepare("INSERT INTO cartItems (fk_user_id, fk_product_id, quantity) VALUES (?, ?, 1)");
            $stmt->execute([$userId, $productId]);
        }
    }

    public function increaseCartItemQuantity(int $userId, int $productId): void
    {
        $stmt = $this->pdo->prepare("UPDATE cartItems SET quantity = quantity + 1 WHERE fk_user_id = ? AND fk_product_id = ?");
        $stmt->execute([$userId, $productId]);
    }

    public function decreaseCartItemQuantity(int $userId, int $productId): void
    {
        $stmt = $this->pdo->prepare("SELECT quantity FROM cartItems WHERE fk_user_id = ? AND fk_product_id = ?");
        $stmt->execute([$userId, $productId]);
        $row = $stmt->fetch();

        if ($row) {
            if ($row['quantity'] <= 1) {
                $this->removeCartItem($userId, $productId);
            } else {
                $stmt = $this->pdo->prepare("UPDATE cartItems SET quantity = quantity - 1 WHERE fk_user_id = ? AND fk_product_id = ?");
                $stmt->execute([$userId, $productId]);
            }
        }
    }

    public function removeCartItem(int $userId, int $productId): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM cartItems WHERE fk_user_id = ? AND fk_product_id = ?");
        $stmt->execute([$userId, $productId]);
    }

    public function clearCart(int $userId): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM cartItems WHERE fk_user_id = ?");
        $stmt->execute([$userId]);
    }



    // ***********************************
    // ********** order queries **********
    // ***********************************


    public function createNewOrder(int $userId, float $totalAmount, array $cartItems): int
    {
        $stmtOrder = $this->pdo->prepare("
            INSERT INTO orders (fk_user_id, total_amount, status, created_at)
            VALUES (?, ?, 'pending', NOW())
        ");
        $stmtOrder->execute([$userId, $totalAmount]);
       
        $orderId = (int) $this->pdo->lastInsertId();
       
        $stmtItems = $this->pdo->prepare("
            INSERT INTO orderItems (fk_order_id, fk_product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        ");

        foreach ($cartItems as $item) {
            $stmtItems->execute([
                $orderId,
                $item['id'], 
                $item['quantity'],
                $item['price']
            ]);
        }

        return $orderId;
    }


    public function getAllOrdersForAdmin(): array
    {
        $stmt = $this->pdo->prepare("
        SELECT 
            o.order_id,
            o.fk_user_id,
            o.total_amount,
            o.status,
            o.created_at,
            u.username,
            u.email,
            oi.order_item_id,
            oi.fk_product_id,
            oi.quantity,
            oi.price,
            p.name AS product_name
        FROM orders o
        INNER JOIN users u ON o.fk_user_id = u.user_id
        LEFT JOIN orderItems oi ON o.order_id = oi.fk_order_id
        LEFT JOIN products p ON oi.fk_product_id = p.product_id
        ORDER BY o.created_at DESC, o.order_id DESC
    ");

        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $orders = [];

        foreach ($rows as $row) {
            $orderId = $row['order_id'];

            if (!isset($orders[$orderId])) {
                $orders[$orderId] = [
                    'order_id' => (int) $row['order_id'],
                    'fk_user_id' => (int) $row['fk_user_id'],
                    'username' => $row['username'],
                    'email' => $row['email'],
                    'total_amount' => (float) $row['total_amount'],
                    'status' => $row['status'],
                    'created_at' => $row['created_at'],
                    'items' => []
                ];
            }

            if (!empty($row['order_item_id'])) {
                $orders[$orderId]['items'][] = [
                    'order_item_id' => (int) $row['order_item_id'],
                    'fk_product_id' => (int) $row['fk_product_id'],
                    'product_name' => $row['product_name'],
                    'quantity' => (int) $row['quantity'],
                    'price' => (float) $row['price']
                ];
            }
        }

        return array_values($orders);
    }

    public function updateOrderStatus(int $orderId, string $status): bool
    {
        $stmt = $this->pdo->prepare("
        UPDATE orders 
        SET status = ?
        WHERE order_id = ?
    ");

        $stmt->execute([$status, $orderId]);

        return $stmt->rowCount() > 0;
    }

}
