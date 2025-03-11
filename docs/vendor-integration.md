# Vendor Integration System

## Overview

The vendor integration system provides a unified interface for scraping and accessing electronic component data from various vendors. The system is designed to be:

- Resilient to network issues and rate limits
- Extensible for new vendors
- Type-safe with TypeScript
- Well-tested with Jest
- Respectful of vendor resources

## Core Components

### 1. Base Types (`src/vendors/types.ts`)

```typescript
interface Component {
  id?: number;
  partNumber: string;
  name: string;
  description?: string;
  manufacturer?: string;
  category: string;
  specifications: ComponentSpecs;
  datasheet?: string;
  imageUrl?: string;
  url?: string;
}

interface ComponentPrice {
  price: number;
  currency: string;
  quantity: number;
  breakPoints?: { quantity: number; price: number }[];
  inStock: boolean;
  stockQuantity?: number;
  deliveryDays?: number;
  lastUpdated: Date;
}

interface StockInfo {
  inStock: boolean;
  quantity?: number;
  deliveryDays?: number;
  lastChecked: Date;
}
```

### 2. Base Vendor Class (`src/vendors/base/BaseVendor.ts`)

The `BaseVendor` class provides:
- Rate limiting with token bucket algorithm
- Retry mechanism with exponential backoff
- Error handling and categorization
- Common vendor operations interface

```typescript
abstract class BaseVendor implements VendorIntegration {
  abstract search(query: string, options?: SearchOptions): Promise<Component[]>;
  abstract getPrice(partNumber: string): Promise<ComponentPrice>;
  abstract checkStock(partNumber: string): Promise<StockInfo>;
  abstract getDetails(partNumber: string): Promise<Component>;
}
```

### 3. Base Scraper Class (`src/vendors/scrapers/base/BaseScraper.ts`)

The `BaseScraper` class provides:
- Browser initialization and management
- Page navigation and interaction
- Element extraction utilities
- Error handling for web scraping
- Random delays and request throttling

## Implemented Vendors

### 1. Electrokit (`src/vendors/electrokit/ElektrokitScraper.ts`)

Implementation details:
- Base URL: https://www.electrokit.com
- Rate limit: 2 requests per second
- Language: English version of the site
- Timeout: 45 seconds (extended due to occasional slow responses)

Features:
- Product search with pagination
- Detailed product information extraction
- Price tracking with quantity breaks
- Stock level monitoring
- Delivery time estimation

Example usage:
```typescript
const vendor = new ElektrokitVendor();

// Search for components
const results = await vendor.search('resistor 10k', {
  limit: 10,
  category: 'resistor',
  inStock: true
});

// Get price information
const price = await vendor.getPrice('ABC123');

// Check stock
const stock = await vendor.checkStock('ABC123');

// Get full details
const details = await vendor.getDetails('ABC123');
```

### Category Mapping

Electrokit categories are mapped to standardized categories:
```typescript
const categoryMap = {
  'Motstånd': 'resistor',
  'Kondensator': 'capacitor',
  'Transistor': 'transistor',
  'IC': 'integrated_circuit',
  'LED': 'led'
};
```

## Error Handling

The system defines several error types:
- `API`: Vendor API-related errors
- `NETWORK`: Network connectivity issues
- `PARSING`: Data extraction failures
- `RATE_LIMIT`: Rate limiting violations
- `OTHER`: Miscellaneous errors

Each error includes:
- Type classification
- Retryable flag
- Vendor-specific details (when available)
- Stack trace

## Testing

Tests are implemented using Jest:
- Timeout set to 30 seconds for scraping operations
- Browser cleanup after each test
- Mocked responses for faster testing (TODO)

Example test suite:
```typescript
describe('ElektrokitVendor', () => {
  it('should return components for a valid search query', async () => {
    const results = await vendor.search('resistor 10k');
    expect(results.length).toBeGreaterThan(0);
  });
});
```

## Safety Features

1. Rate Limiting
   - Token bucket algorithm
   - Configurable rates per vendor
   - Automatic retry with backoff

2. Browser Management
   - Automatic cleanup
   - Resource optimization
   - Memory leak prevention

3. Request Throttling
   - Random delays between requests
   - Configurable timeouts
   - Request interception

4. Error Recovery
   - Automatic retries
   - Exponential backoff
   - Error categorization

## Future Improvements

1. Caching Layer
   - Redis integration
   - Configurable TTL
   - Cache invalidation

2. Proxy Support
   - Proxy rotation
   - IP blocking prevention
   - Geographic distribution

3. Monitoring
   - Success rate tracking
   - Response time monitoring
   - Error rate alerting

4. Additional Vendors
   - Mouser
   - Digikey
   - Farnell
   - RS Components

## Contributing

To add a new vendor:

1. Create a new directory under `src/vendors/[vendor-name]`
2. Implement the `VendorIntegration` interface
3. Add appropriate tests
4. Update documentation
5. Submit a pull request

## Best Practices

1. Rate Limiting
   - Always respect vendor rate limits
   - Implement exponential backoff
   - Monitor request patterns

2. Error Handling
   - Categorize errors appropriately
   - Include relevant context
   - Log meaningful messages

3. Testing
   - Test with real vendor data
   - Mock responses when appropriate
   - Clean up resources

4. Documentation
   - Document vendor specifics
   - Include usage examples
   - Keep category mappings updated 