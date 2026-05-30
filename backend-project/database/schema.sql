-- SCMS Database Schema for SupplyNet Ltd
-- Run: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS SCMS;
USE SCMS;

-- Users (procurement officers)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplier
CREATE TABLE IF NOT EXISTS supplier (
  supplierCode VARCHAR(20) PRIMARY KEY,
  supplierName VARCHAR(100) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  address VARCHAR(200) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipment
CREATE TABLE IF NOT EXISTS shipment (
  shipmentNumber VARCHAR(20) PRIMARY KEY,
  shipmentDate DATE NOT NULL,
  shipmentStatus ENUM('Pending', 'In Transit', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  destination VARCHAR(150) NOT NULL,
  supplierCode VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_shipment_supplier
    FOREIGN KEY (supplierCode) REFERENCES supplier(supplierCode)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Delivery
CREATE TABLE IF NOT EXISTS delivery (
  deliveryCode VARCHAR(20) PRIMARY KEY,
  deliveryDate DATE NOT NULL,
  quantityDelivered INT NOT NULL CHECK (quantityDelivered > 0),
  deliveryStatus ENUM('Scheduled', 'In Progress', 'Completed', 'Failed') NOT NULL DEFAULT 'Scheduled',
  shipmentNumber VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_delivery_shipment
    FOREIGN KEY (shipmentNumber) REFERENCES shipment(shipmentNumber)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_shipment_date ON shipment(shipmentDate);
CREATE INDEX idx_delivery_date ON delivery(deliveryDate);
CREATE INDEX idx_supplier_created ON supplier(created_at);
