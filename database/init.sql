-- =============================================
-- MotoTaxi - Base de Datos MySQL
-- Script de inicialización
-- =============================================

CREATE DATABASE IF NOT EXISTS mototaxi;
USE mototaxi;

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

-- ==================== VIAJES ====================
CREATE TABLE IF NOT EXISTS rides (
    id VARCHAR(36) PRIMARY KEY,
    passenger_id VARCHAR(36) NOT NULL,
    driver_id VARCHAR(36) DEFAULT NULL,
    status ENUM('searching', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'searching',
    pickup_location VARCHAR(500) NOT NULL,
    pickup_lat DECIMAL(10, 8) DEFAULT NULL,
    pickup_lng DECIMAL(11, 8) DEFAULT NULL,
    dropoff_location VARCHAR(500) NOT NULL,
    dropoff_lat DECIMAL(10, 8) DEFAULT NULL,
    dropoff_lng DECIMAL(11, 8) DEFAULT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    estimated_price DECIMAL(10, 2) DEFAULT 0.00,
    actual_price DECIMAL(10, 2) DEFAULT NULL,
    distance FLOAT DEFAULT NULL,
    duration INT DEFAULT NULL,
    start_time TIMESTAMP NULL DEFAULT NULL,
    end_time TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== CALIFICACIONES ====================
CREATE TABLE IF NOT EXISTS ratings (
    id VARCHAR(36) PRIMARY KEY,
    ride_id VARCHAR(36) NOT NULL,
    from_user_id VARCHAR(36) NOT NULL,
    to_user_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================== MÉTODOS DE PAGO ====================
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('cash', 'card', 'wallet') DEFAULT 'cash',
    card_brand VARCHAR(50) DEFAULT NULL,
    last_four VARCHAR(4) DEFAULT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================== UBICACIONES DE CONDUCTORES ====================
CREATE TABLE IF NOT EXISTS driver_locations (
    id VARCHAR(36) PRIMARY KEY,
    driver_id VARCHAR(36) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================== MENSAJES DE CHAT ====================
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    ride_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
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
CREATE INDEX idx_rides_passenger ON rides(passenger_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_ratings_to_user ON ratings(to_user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_driver_locations_driver ON driver_locations(driver_id);
CREATE INDEX idx_messages_ride ON messages(ride_id);

-- ==================== DATOS DE PRUEBA ====================
INSERT INTO users (id, email, password, full_name, user_type, photo, rating, rides, wallet_balance) VALUES
('demo-passenger-001', 'passenger@demo.com', '$2a$10$xVqYLGEwGr.pHJdP8BTRouPh1KBkfGBvXMEB9YSBvDAKpLtNIqkUq', 'Pasajero Demo', 'passenger', 'https://api.dicebear.com/7.x/avataaars/svg?seed=passenger', 5.0, 12, 150.00),
('demo-driver-001', 'driver@demo.com', '$2a$10$xVqYLGEwGr.pHJdP8BTRouPh1KBkfGBvXMEB9YSBvDAKpLtNIqkUq', 'Conductor Demo', 'driver', 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver', 4.8, 45, 1250.00);

-- Password: "password" hasheado con bcrypt
