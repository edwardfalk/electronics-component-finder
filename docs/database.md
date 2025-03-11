# Database Schema Documentation

This document describes the database schema for the Electronic Components Finder application.

## Overview

The database is designed to store and manage:
- Electronic component information
- Vendor details and pricing
- User shopping lists
- Price history and tracking
- Cache data for API responses

## Tables

### components

Stores information about electronic components.

```sql
CREATE TABLE components (
    id SERIAL PRIMARY KEY,
    part_number VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(100),
    category VARCHAR(50),
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_components_part_number ON components(part_number);
CREATE INDEX idx_components_manufacturer ON components(manufacturer);
CREATE INDEX idx_components_category ON components(category);
```

#### Fields
- `id`: Unique identifier
- `part_number`: Manufacturer's part number
- `name`: Component name
- `description`: Detailed description
- `manufacturer`: Component manufacturer
- `category`: Component category (e.g., resistor, capacitor)
- `specifications`: Technical specifications as JSON
- `created_at`: Record creation timestamp

### vendors

Stores information about component suppliers.

```sql
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    api_endpoint VARCHAR(255),
    country_code CHAR(2),
    shipping_to_sweden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_country_code ON vendors(country_code);
```

#### Fields
- `id`: Unique identifier
- `name`: Vendor name
- `url`: Vendor website URL
- `api_endpoint`: API endpoint for automated queries
- `country_code`: ISO country code
- `shipping_to_sweden`: Whether vendor ships to Sweden
- `created_at`: Record creation timestamp

### prices

Tracks component pricing and stock information.

```sql
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    component_id INTEGER REFERENCES components(id),
    vendor_id INTEGER REFERENCES vendors(id),
    price DECIMAL(10,2),
    currency CHAR(3),
    stock_quantity INTEGER,
    delivery_time_days INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(component_id, vendor_id)
);

CREATE INDEX idx_prices_component_id ON prices(component_id);
CREATE INDEX idx_prices_vendor_id ON prices(vendor_id);
CREATE INDEX idx_prices_last_updated ON prices(last_updated);
```

#### Fields
- `id`: Unique identifier
- `component_id`: Reference to components table
- `vendor_id`: Reference to vendors table
- `price`: Current price
- `currency`: ISO currency code
- `stock_quantity`: Available stock
- `delivery_time_days`: Estimated delivery time
- `last_updated`: Last price update timestamp

### shopping_lists

Stores user-created lists of components.

```sql
CREATE TABLE shopping_lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shopping_lists_name ON shopping_lists(name);
```

#### Fields
- `id`: Unique identifier
- `name`: List name
- `description`: List description
- `created_at`: Record creation timestamp

### shopping_list_items

Links components to shopping lists with quantities.

```sql
CREATE TABLE shopping_list_items (
    id SERIAL PRIMARY KEY,
    shopping_list_id INTEGER REFERENCES shopping_lists(id),
    component_id INTEGER REFERENCES components(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shopping_list_id, component_id)
);

CREATE INDEX idx_shopping_list_items_list_id ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_shopping_list_items_component_id ON shopping_list_items(component_id);
```

#### Fields
- `id`: Unique identifier
- `shopping_list_id`: Reference to shopping_lists table
- `component_id`: Reference to components table
- `quantity`: Number of components needed
- `created_at`: Record creation timestamp

### cache

Stores temporary data for API responses and calculations.

```sql
CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_cache_expires_at ON cache(expires_at);
```

#### Fields
- `key`: Cache key
- `value`: Cached data as JSON
- `expires_at`: Cache expiration timestamp

## Relationships

### Primary Relationships

1. **components ↔ prices**
   - One-to-many: A component can have multiple prices from different vendors
   - Foreign key: `prices.component_id` references `components.id`

2. **vendors ↔ prices**
   - One-to-many: A vendor can have prices for multiple components
   - Foreign key: `prices.vendor_id` references `vendors.id`

3. **shopping_lists ↔ shopping_list_items**
   - One-to-many: A shopping list can contain multiple items
   - Foreign key: `shopping_list_items.shopping_list_id` references `shopping_lists.id`

4. **components ↔ shopping_list_items**
   - One-to-many: A component can be in multiple shopping lists
   - Foreign key: `shopping_list_items.component_id` references `components.id`

### Constraints

1. **Unique Constraints**
   - `prices`: One price per component per vendor
   - `shopping_list_items`: One entry per component per list

2. **Foreign Key Constraints**
   - All foreign keys have ON DELETE CASCADE
   - Ensures referential integrity

3. **Not Null Constraints**
   - Essential fields marked as NOT NULL
   - Ensures data integrity

## Indexes

### Primary Indexes
- All primary keys are automatically indexed
- Foreign key columns are indexed for join performance

### Secondary Indexes
1. **components**
   - `part_number`: Fast lookup by part number
   - `manufacturer`: Filter by manufacturer
   - `category`: Filter by component type

2. **vendors**
   - `name`: Quick vendor search
   - `country_code`: Regional filtering

3. **prices**
   - `last_updated`: Time-based queries
   - Composite indexes for common queries

4. **cache**
   - `expires_at`: Cleanup of expired entries

## Data Types

### Standard Types
- `INTEGER`: For IDs and quantities
- `VARCHAR`: For text with known max length
- `TEXT`: For unlimited text
- `TIMESTAMP WITH TIME ZONE`: For dates
- `BOOLEAN`: For true/false flags
- `DECIMAL(10,2)`: For prices
- `CHAR(2)`: For country codes
- `CHAR(3)`: For currency codes

### Special Types
- `JSONB`: For flexible data storage
  - Component specifications
  - Cached data
  - Better performance than JSON
  - Indexable

## Maintenance

### Regular Tasks
1. **Cache Cleanup**
   ```sql
   DELETE FROM cache WHERE expires_at < CURRENT_TIMESTAMP;
   ```

2. **Price History Archival**
   ```sql
   -- Archive old prices to history table
   INSERT INTO price_history
   SELECT * FROM prices
   WHERE last_updated < (CURRENT_TIMESTAMP - INTERVAL '30 days');
   ```

3. **Index Maintenance**
   ```sql
   VACUUM ANALYZE components;
   VACUUM ANALYZE prices;
   VACUUM ANALYZE cache;
   ```

### Monitoring Queries

1. **Table Sizes**
   ```sql
   SELECT relname as table_name,
          pg_size_pretty(pg_total_relation_size(relid)) as total_size
   FROM pg_catalog.pg_statio_user_tables
   ORDER BY pg_total_relation_size(relid) DESC;
   ```

2. **Index Usage**
   ```sql
   SELECT schemaname, relname, indexrelname, idx_scan
   FROM pg_stat_user_indexes
   ORDER BY idx_scan DESC;
   ```

3. **Cache Statistics**
   ```sql
   SELECT count(*) as total_entries,
          count(*) FILTER (WHERE expires_at < CURRENT_TIMESTAMP) as expired
   FROM cache;
   ``` 