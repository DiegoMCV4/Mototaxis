-- =============================================
-- MotoTaxi — Payments Service Database
-- Base de datos: mototaxi_payments
-- Motor: MySQL 8.0
-- =============================================

CREATE DATABASE IF NOT EXISTS mototaxi_payments;
USE mototaxi_payments;

-- ==================== MÉTODOS DE PAGO ====================
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('cash', 'card', 'wallet') DEFAULT 'cash',
    card_brand VARCHAR(50) DEFAULT NULL,
    last_four VARCHAR(4) DEFAULT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TRANSACCIONES ====================
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    ride_id VARCHAR(36) DEFAULT NULL,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('charge', 'payment', 'refund', 'topup') NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    description VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== WALLET ====================
CREATE TABLE IF NOT EXISTS wallets (
    user_id VARCHAR(36) PRIMARY KEY,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==================== ÍNDICES ====================
CREATE INDEX idx_pm_user ON payment_methods(user_id);
CREATE INDEX idx_tx_user ON transactions(user_id);
CREATE INDEX idx_tx_ride ON transactions(ride_id);
CREATE INDEX idx_tx_status ON transactions(status);

-- ==================== DATOS DE PRUEBA ====================
INSERT INTO wallets (user_id, balance) VALUES
('demo-passenger-001', 150.00),
('demo-driver-001', 1250.00)
ON DUPLICATE KEY UPDATE balance = VALUES(balance);
