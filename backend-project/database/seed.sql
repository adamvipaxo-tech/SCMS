USE SCMS;

-- Default admin user is created automatically when the API starts (first run only).

INSERT INTO supplier (supplierCode, supplierName, telephone, address, email) VALUES
('SUP001', 'Kigali Fresh Foods Ltd', '+250788123456', 'KG 15 Ave, Kigali', 'contact@kigalifresh.rw'),
('SUP002', 'Northern Grains Cooperative', '+250788654321', 'Musanze Main Road', 'info@northerngrains.rw')
ON DUPLICATE KEY UPDATE supplierName = VALUES(supplierName);

INSERT INTO shipment (shipmentNumber, shipmentDate, shipmentStatus, destination, supplierCode) VALUES
('SHP001', CURDATE(), 'In Transit', 'Musanze Warehouse', 'SUP001'),
('SHP002', CURDATE(), 'Pending', 'Rubavu Distribution Center', 'SUP002')
ON DUPLICATE KEY UPDATE shipmentStatus = VALUES(shipmentStatus);

INSERT INTO delivery (deliveryCode, deliveryDate, quantityDelivered, deliveryStatus, shipmentNumber) VALUES
('DEL001', CURDATE(), 500, 'In Progress', 'SHP001'),
('DEL002', CURDATE(), 200, 'Scheduled', 'SHP002')
ON DUPLICATE KEY UPDATE deliveryStatus = VALUES(deliveryStatus);
