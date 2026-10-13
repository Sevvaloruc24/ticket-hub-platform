CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    seat_number VARCHAR(10) NOT NULL UNIQUE,
    section VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    locked_by VARCHAR(64),
    locked_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_id INT REFERENCES seats(id),
    customer_email VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_reference VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO seats (seat_number, section, price, status)
VALUES 
    ('A1', 'VIP', 1500.00, 'AVAILABLE'),
    ('A2', 'VIP', 1500.00, 'AVAILABLE'),
    ('B1', 'STANDARD', 750.00, 'AVAILABLE'),
    ('B2', 'STANDARD', 750.00, 'AVAILABLE'),
    ('B3', 'STANDARD', 750.00, 'AVAILABLE')
ON CONFLICT (seat_number) DO NOTHING;
