-- =============================================
-- MotoTaxi — Auth Service Database
-- Base de datos: mototaxi_auth
-- Motor: MySQL 8.0
-- =============================================

CREATE DATABASE IF NOT EXISTS mototaxi_auth;
USE mototaxi_auth;

-- ==================== USUARIOS ====================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type ENUM('passenger', 'driver') NOT NULL,
    photo VARCHAR(500) DEFAULT NULL,
    rating FLOAT DEFAULT 5.0,
    rides INT DEFAULT 0,
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    phone VARCHAR(20) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==================== CONTACTOS DE EMERGENCIA ====================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================== ÍNDICES ====================
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_emergency_user ON emergency_contacts(user_id);

-- ==================== DATOS DE PRUEBA ====================
-- Password: "password" hasheado con bcrypt rounds=10
INSERT INTO users (id, email, password, full_name, user_type, photo, rating, rides, wallet_balance, phone) VALUES
 ('demo-passenger-001', 'passenger@demo.com',
  '$2a$10$V8qo4awYy6jogqIP6L5i9.ZdJ0cJ3lh0/paidMxUG7UIw41CFk.T6',
  'Pasajero Demo', 'passenger',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=passenger',
  5.0, 12, 150.00, '999-000-001'),
 ('demo-driver-001', 'driver@demo.com',
  '$2a$10$V8qo4awYy6jogqIP6L5i9.ZdJ0cJ3lh0/paidMxUG7UIw41CFk.T6',
 'Conductor Demo', 'driver',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver',
 4.8, 45, 1250.00, '999-000-002')
ON DUPLICATE KEY UPDATE id = id;
