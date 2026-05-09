-- =============================================
-- MotoTaxi — Rides Service Database
-- Base de datos: mototaxi_rides
-- Motor: MySQL 8.0
-- Nota: passenger_id y driver_id referencian mototaxi_auth.users
--       (sin FK cross-database — integridad garantizada por el dominio)
-- =============================================

CREATE DATABASE IF NOT EXISTS mototaxi_rides;
USE mototaxi_rides;

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==================== MENSAJES DE CHAT ====================
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    ride_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE
);

-- ==================== UBICACIONES DE CONDUCTORES (para tracking) ====================
CREATE TABLE IF NOT EXISTS driver_locations (
    id VARCHAR(36) PRIMARY KEY,
    driver_id VARCHAR(36) NOT NULL UNIQUE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==================== ÍNDICES ====================
CREATE INDEX idx_rides_passenger ON rides(passenger_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_messages_ride ON messages(ride_id);
CREATE INDEX idx_driver_online ON driver_locations(is_online);

