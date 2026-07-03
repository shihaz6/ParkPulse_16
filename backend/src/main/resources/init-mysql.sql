-- MySQL Database Initialization Script for ParkPulse
-- ===================================================
-- Run this script in your MySQL client (e.g., MySQL Workbench, CLI, or phpMyAdmin)
-- before starting the application with the MySQL profile.

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS parkpulsedb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 2. Create the application user (replace 'your_strong_password' with an actual password)
CREATE USER IF NOT EXISTS 'parkpulse_user'@'localhost' IDENTIFIED BY 'shihaz#1';

-- 3. Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON parkpulsedb.* TO 'parkpulse_user'@'localhost';

-- 4. Apply the changes
FLUSH PRIVILEGES;

-- 5. Verify (optional)
-- SHOW DATABASES LIKE 'parkpulse%';
-- SELECT User, Host FROM mysql.user WHERE User = 'parkpulse_user';
