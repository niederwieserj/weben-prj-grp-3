INSERT INTO `products`(`name`, `description`, `avg_rating`, `total_ratings_count`, `price`, `stock_quantity`, `fk_category_id`) VALUES ('RTX-5080','Wooow such a nice graphics card!','4.8','10','499','20','1')

INSERT INTO `categories`(`category_id`, `name`) VALUES ('1','Graphics cards')


INSERT INTO `product_ratings`(`product_id`, `user_id`, `score`, `comment`) VALUES ('1','1','4','Damn so nice');

INSERT INTO `product_images`(`fk_product_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`) VALUES ('1','/backend/product-pictures/RTX-5080-16g-vanguard-msi.png','RTX-5080 graphics card','0','1');

SELECT 
                *
            FROM products p
            LEFT JOIN product_images i ON p.product_id = i.fk_product_id
            ORDER BY p.product_id ASC;