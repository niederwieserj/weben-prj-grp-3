<?php

// Database Configuration (Hardcoded for development)
define('DB_HOST', 'database');
define('DB_NAME', 'webshop');
define('DB_USER', 'root');
define('DB_PASS', 'tiger');

require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/user.class.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/product.class.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/productRating.class.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/productImage.class.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/backend/models/category.class.php';

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
    public function getAllProductsWithImages(): array
    {
        // 1. The SQL Query
        // We join ratings and images. 
        // We use DISTINCT to avoid duplicates if a product has multiple images/ratings 
        // causing a Cartesian product explosion, OR we handle the grouping in PHP.
        // Here, we fetch raw data and group in PHP for maximum flexibility.

        $sql = "
            SELECT 
                *
            FROM products p
            LEFT JOIN product_images i ON p.product_id = i.fk_product_id
            ORDER BY p.product_id ASC
        ";

        $stmt = $this->pdo->query($sql);
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

    // searchbar live product search query
    public function searchProducts(string $search): array
    {
        $stmt = $this->pdo->prepare("SELECT name, product_id 
                                    FROM products 
                                    WHERE name 
                                    LIKE ?");
        $stmt->execute(["%$search%"]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
  

}
