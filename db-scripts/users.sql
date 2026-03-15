-- Create tables in DB
-- Schema from https://mysql101.com/mysql-tutorial/2025/01/09/Designing-a-Set-of-Tables-for-User-Login-in/
-- Changes to schema: prefix foreign keys with FK_ to make it more clear

CREATE TABLE users (
   user_id INT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(50) NOT NULL UNIQUE,
   password_hash VARCHAR(255) NOT NULL,
   email VARCHAR(100) UNIQUE NOT NULL,
   role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
   is_active BOOLEAN DEFAULT TRUE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE login_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique log ID
    FK_user_id INT NOT NULL,                   -- User ID (foreign key)
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Time of login
    ip_address VARCHAR(45),                 -- IP address (supports IPv4 and IPv6)
    device_info VARCHAR(255),               -- Information about the device used
    success BOOLEAN DEFAULT TRUE,           -- Whether the login was successful
    FOREIGN KEY (FK_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Practical statements

-- Add new user
INSERT INTO users (username, password_hash, email, role)
VALUES ('lexan', SHA2('lexan', 256), 'lexan@gmail.com', 'admin');

-- Add new user
INSERT INTO users (username, password_hash, email)
VALUES ('alice', SHA2('test123', 256), 'alice@example.com');

-- Add new user
INSERT INTO users (username, password_hash, email)
VALUES ('bob', SHA2('test123', 256), 'bob@example.com');

-- Add new login attempt
INSERT INTO login_logs (FK_user_id, ip_address, device_info, success)
VALUES (1, '192.168.1.1', 'Chrome on Windows 10', TRUE);

-- Get login history for user
SELECT login_time, ip_address, device_info, success
FROM login_logs
WHERE FK_user_id = 1
ORDER BY login_time DESC;
