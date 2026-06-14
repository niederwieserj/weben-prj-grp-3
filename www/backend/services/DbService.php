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

/* available functions:

    PRODUCT QUERIES:
    CATEGORY & RATING:
        - getCategories(): array
        - getRatingById(int $id): ?ProductRating
    - getProductById(int $id): ?Product
    - getAllProductsWithImages(?string $searchTerm = null): array
    - createProduct(array $data): int
    - updateProduct(int $productId, array $data): bool
    - createProductImage(int $productId, string $imageUrl, string $altText): int
    - upsertPrimaryProductImage(int $productId, string $imageUrl, string $altText): void
    - getProductByIdWithImages(int $productId): ?array
    - getAllProducts(): array


USER QUERIES:
    - getUserById(int $id): ?User
    - getUserByEmailOrUsername(string $identifier): ?User
    - getAllUsers(): array
    - createUser(User $user): int
    - createAddress(Address $address): int
    - getAddressByUserId(int $userId): ?Address
    - updateUser(User $user): bool
    - checkUniqueUser(int $excludeId, string $username, string $email): bool
    - setResetToken(int $userId, string $token, string $expires): bool
    - getUserByToken(string $token): ?User
    - updatePassword(int $userId, string $hash): bool
    - beginTransaction(): void
    - commit(): void
    - rollback(): void


CART QUERIES:
    - getCartItems(int $userId): array
    - addCartItem(int $userId, int $productId): void
    - increaseCartItemQuantity(int $userId, int $productId): void
    - decreaseCartItemQuantity(int $userId, int $productId): void
    - removeCartItem(int $userId, int $productId): void
    - clearCart(int $userId): void

ORDER QUERIES:	
    - createNewOrder(int $userId, float $totalAmount, array $cartItems): int
    - getAllOrdersForAdmin(): array
    - updateOrderStatus(int $orderId, string $status): bool
    - getOrdersByUserId(int $userId): array

*/

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



    /***********************************************************************/
    /*                       product category query                        */
    /***********************************************************************/

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



    /***********************************************************************/
    /*                            product rating                           */
    /***********************************************************************/
    //Returns a single Product object or null.

    public function getRatingById(int $id): ?ProductRating
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM product_ratings WHERE product_id = ?"
        );
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ? new ProductRating($result) : null;
    }



    /***********************************************************************/
    /*                            product queries                          */
    /***********************************************************************/

    //Returns a single Product object or null.

    public function getProductById(int $id): ?Product
    {
        $stmt = $this->pdo->prepare(
            "SELECT *, fk_category_id AS category_id FROM products WHERE product_id = ?"
        );
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ? new Product($result) : null;
    }

    /*
      Fetch all products with their associated images.
      Returns an array of arrays: [ [Product, Image[]], ... ]
     */
    public function getAllProductsWithImages(?string $searchTerm = null): array
    {
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



    /*************************/
    //      (admin only)
    /*************************/
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


    /*************************/
    //      (admin only)
    /*************************/
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


    /*************************/
    //      (admin only)
    /*************************/
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

        // grouping
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

        // return single entry directly
        return array_values($groupedProducts)[0] ?? null;
    }




    /**
     * Return an array of Product objects
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






    /***********************************************************************/
    /*                                                                     */
    /*                             user queries                            */
    /*                                                                     */
    /***********************************************************************/

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




    public function getAllUsers(): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT *, fk_title_id AS title_id FROM users ORDER BY created_at DESC"
        );

        $stmt->execute();
        $results = $stmt->fetchAll();

        $users = [];
        foreach ($results as $row) {
            $users[] = new User($row);
        }

        return $users;
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





    public function getAddressByUserId(int $userId): ?Address
    {
        $stmt = $this->pdo->prepare("SELECT * FROM addresses WHERE fk_user_id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        return $result ? new Address($result) : null;
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


    /********************************************/
    /*            set/unset cookie              */
    /********************************************/
    public function setRememberMeCookie(int $userId, string $rememberMeCookie): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE users 
            SET rememberme_hash = ?
            WHERE user_id = ?
        ");
        return $stmt->execute([$rememberMeCookie, $userId]);
    }


    public function unsetRememberMeCookie(int $userId): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE users 
            SET rememberme_hash = NULL
            WHERE user_id = ?
        ");
        return $stmt->execute([$userId]);
    }

    public function getUserByRememberMeHash(string $tokenHash): ?User
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM users WHERE rememberme_hash = ? LIMIT 1
        ");
        $stmt->execute([$tokenHash]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ? new User($result) : null;
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



    /*

    public function searchProducts(string $search): array
    {
        $stmt = $this->pdo->prepare("SELECT name, product_id 
                                    FROM products 
                                    WHERE name 
                                    LIKE ?");
        $stmt->execute(["%$search%"]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }*/



    /***********************************************************************/
    /*                             cart queries                            */
    /***********************************************************************/


    public function getCartItems(int $userId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                p.product_id AS id,
                p.name,
                p.price,
                i.image_url AS imageUrl,
                c.quantity
            FROM cart_items c
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
        $stmt = $this->pdo->prepare("SELECT quantity FROM cart_items WHERE fk_user_id = ? AND fk_product_id = ?");
        $stmt->execute([$userId, $productId]);
        $row = $stmt->fetch();

        if ($row) {
            $this->increaseCartItemQuantity($userId, $productId);
        } else {
            $stmt = $this->pdo->prepare("INSERT INTO cart_items (fk_user_id, fk_product_id, quantity) VALUES (?, ?, 1)");
            $stmt->execute([$userId, $productId]);
        }
    }



    public function increaseCartItemQuantity(int $userId, int $productId): void
    {
        $stmt = $this->pdo->prepare("UPDATE cart_items SET quantity = quantity + 1 WHERE fk_user_id = ? AND fk_product_id = ?");
        $stmt->execute([$userId, $productId]);
    }



    public function decreaseCartItemQuantity(int $userId, int $productId): void
    {
        $stmt = $this->pdo->prepare("SELECT quantity FROM cart_items WHERE fk_user_id = ? AND fk_product_id = ?");
        $stmt->execute([$userId, $productId]);
        $row = $stmt->fetch();

        if ($row) {
            if ($row['quantity'] <= 1) {
                $this->removeCartItem($userId, $productId);
            } else {
                $stmt = $this->pdo->prepare("UPDATE cart_items SET quantity = quantity - 1 WHERE fk_user_id = ? AND fk_product_id = ?");
                $stmt->execute([$userId, $productId]);
            }
        }
    }



    public function removeCartItem(int $userId, int $productId): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM cart_items WHERE fk_user_id = ? AND fk_product_id = ?");
        $stmt->execute([$userId, $productId]);
    }



    public function clearCart(int $userId): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM cart_items WHERE fk_user_id = ?");
        $stmt->execute([$userId]);
    }



    /***********************************************************************/
    /*                            order queries                            */
    /***********************************************************************/

    public function createNewOrder(int $userId, float $totalAmount, array $cartItems): int
    {
        $stmtOrder = $this->pdo->prepare("
            INSERT INTO orders (fk_user_id, total_amount, status, created_at)
            VALUES (?, ?, 'pending', NOW())
        ");
        $stmtOrder->execute([$userId, $totalAmount]);

        $orderId = (int) $this->pdo->lastInsertId();

        $stmtItems = $this->pdo->prepare("
            INSERT INTO order_items (fk_order_id, fk_product_id, quantity, price)
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


    /*************************/
    //      (admin only)
    /*************************/
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
        LEFT JOIN order_items oi ON o.order_id = oi.fk_order_id
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



    /*************************/
    //      (admin only)
    /*************************/
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




    public function getOrdersByUserId(int $userId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT o.*, oi.order_item_id, oi.fk_product_id, p.name as product_name, oi.quantity, oi.price
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.fk_order_id
            LEFT JOIN products p ON oi.fk_product_id = p.product_id
            WHERE o.fk_user_id = ?
            ORDER BY o.created_at DESC
        ");

        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $orders = [];
        foreach ($rows as $row) {
            $orderId = $row['order_id'];
            if (!isset($orders[$orderId])) {
                $orders[$orderId] = [
                    'order_id' => $orderId,
                    'status' => $row['status'],
                    'total_amount' => $row['total_amount'],
                    'created_at' => $row['created_at'],
                    'items' => []
                ];
            }
            if (!empty($row['order_item_id'])) {
                $orders[$orderId]['items'][] = [
                    'product_name' => $row['product_name'],
                    'quantity' => $row['quantity'],
                    'price' => $row['price']
                ];
            }
        }
        return array_values($orders);
    }

    /*************************/
    /*   admin order items   */
    /*************************/

    public function increaseOrderItemQuantity(int $orderItemId): bool
    {
        $stmt = $this->pdo->prepare("
        UPDATE order_items
        SET quantity = quantity + 1
        WHERE order_item_id = ?
    ");

        $stmt->execute([$orderItemId]);

        return $stmt->rowCount() > 0;
    }

    public function decreaseOrderItemQuantity(int $orderItemId): bool
    {
        $stmt = $this->pdo->prepare("
        UPDATE order_items
        SET quantity = quantity - 1
        WHERE order_item_id = ? AND quantity > 1
    ");

        $stmt->execute([$orderItemId]);

        return $stmt->rowCount() > 0;
    }

    public function deleteOrderItem(int $orderItemId): bool
    {
        $stmt = $this->pdo->prepare("
        DELETE FROM order_items
        WHERE order_item_id = ?
    ");

        $stmt->execute([$orderItemId]);

        return $stmt->rowCount() > 0;
    }

    public function getOrderIdByOrderItemId(int $orderItemId): ?int
    {
        $stmt = $this->pdo->prepare("
        SELECT fk_order_id
        FROM order_items
        WHERE order_item_id = ?
    ");

        $stmt->execute([$orderItemId]);

        $orderId = $stmt->fetchColumn();

        return $orderId !== false ? (int) $orderId : null;
    }

    public function recalculateOrderTotal(int $orderId): bool
    {
        $stmt = $this->pdo->prepare("
        UPDATE orders
        SET total_amount = (
            SELECT COALESCE(SUM(quantity * price), 0)
            FROM order_items
            WHERE fk_order_id = ?
        )
        WHERE order_id = ?
    ");

        $stmt->execute([$orderId, $orderId]);

        return $stmt->rowCount() > 0;
    }
}
