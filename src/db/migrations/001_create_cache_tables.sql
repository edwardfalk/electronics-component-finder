-- Create components table
CREATE TABLE IF NOT EXISTS components (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(255),
    category VARCHAR(255),
    specifications JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vendor_results table
CREATE TABLE IF NOT EXISTS vendor_results (
    id SERIAL PRIMARY KEY,
    component_id VARCHAR(255) REFERENCES components(id),
    vendor_id VARCHAR(255) NOT NULL,
    price DECIMAL(10,2),
    currency VARCHAR(3),
    stock INTEGER,
    delivery_time INTEGER,
    url TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(component_id, vendor_id)
);

-- Create similar_products table for future use
CREATE TABLE IF NOT EXISTS similar_products (
    id SERIAL PRIMARY KEY,
    component_id VARCHAR(255) REFERENCES components(id),
    similar_component_id VARCHAR(255) REFERENCES components(id),
    similarity_score DECIMAL(5,4),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(component_id, similar_component_id)
);

-- Create indexes
CREATE INDEX idx_components_name ON components(name);
CREATE INDEX idx_components_category ON components(category);
CREATE INDEX idx_components_manufacturer ON components(manufacturer);
CREATE INDEX idx_vendor_results_component ON vendor_results(component_id);
CREATE INDEX idx_vendor_results_vendor ON vendor_results(vendor_id);
CREATE INDEX idx_vendor_results_last_updated ON vendor_results(last_updated);
CREATE INDEX idx_similar_products_component ON similar_products(component_id);
CREATE INDEX idx_similar_products_similar ON similar_products(similar_component_id); 