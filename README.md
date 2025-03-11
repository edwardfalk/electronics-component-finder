# Electronic Components Finder

A modern web application for finding and comparing electronic components across multiple online shops. The application provides a unified interface to search for components, compare prices, manage parts lists, and access datasheets.

## Features

- **Component Search**
  - Search by component name, manufacturer, or part number
  - Filter by category, shop, and stock status
  - View detailed component information including prices and availability
  - Compare prices across different shops

- **Parts Lists**
  - Create and manage multiple parts lists
  - Add components with quantities
  - View component details within lists
  - Export lists to CSV or PDF formats

- **Datasheets**
  - Search for component datasheets
  - View datasheet metadata (file size, upload date)
  - Download datasheets directly
  - Upload new datasheets with component metadata

## Tech Stack

- **Frontend**
  - React 18.2 with TypeScript
  - Vite 5.1 for build tooling
  - Material-UI v5.15 for components
  - TanStack Query v5.20 for data fetching
  - React Router v6.22 for navigation

- **Web Scraping**
  - Puppeteer v22.1 for browser automation
  - Custom scraper framework for vendor-specific implementations
  - Rate limiting and retry mechanisms
  - Error handling and debugging features

## Project Structure

```
src/
├── api/              # API client functions
├── components/       # Reusable React components
├── lib/             # Core library code
│   ├── base/        # Base classes
│   └── scrapers/    # Scraper implementations
├── pages/           # Page components
├── types/           # TypeScript interfaces
├── utils/           # Utility functions
├── vendors/         # Vendor-specific implementations
├── App.tsx          # Main application component
└── main.tsx         # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/electronic-components-finder.git
   cd electronic-components-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # .env
   VITE_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Development

### Adding a New Vendor

1. Create a new directory under `src/vendors/` for the vendor
2. Create a scraper class that extends `BaseScraper`
3. Create a vendor class that extends `BaseVendor`
4. Implement the required methods:
   - `searchProducts()`
   - `scrapeProductDetails()`
   - `extractPriceDetails()`
   - `extractStockInfo()`

Example:
```typescript
import { BaseScraper, ScraperOptions } from '../../lib/scrapers/base/BaseScraper';
import { BaseVendor } from '../../lib/base/BaseVendor';
import { Component, ComponentPrice, SearchOptions, StockInfo } from '../../types';

export class NewVendorScraper extends BaseScraper {
  // Implement scraper methods
}

export class NewVendor extends BaseVendor {
  private scraper: NewVendorScraper;

  constructor() {
    super('Vendor Name', 'https://vendor.com', 2); // 2 requests per second
    this.scraper = new NewVendorScraper();
  }

  // Implement vendor methods
}
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

The production build will be available in the `dist` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Puppeteer](https://pptr.dev/) for web scraping capabilities
- [Material-UI](https://mui.com/) for the component library
- [TanStack Query](https://tanstack.com/query/latest) for data fetching
- [Vite](https://vitejs.dev/) for the build system

## Scraping Framework Implementation

### Core Classes

#### BaseScraper
The `BaseScraper` class provides the foundation for all vendor-specific scrapers with the following features:
- Browser initialization and management using Puppeteer
- Configurable options for timeouts, viewport, user agent, and proxy settings
- Page navigation and content extraction utilities
- Error handling and screenshot capabilities for debugging
- Rate limiting and retry mechanisms

```typescript
class BaseScraper {
  protected browser: Browser | null;
  protected page: Page | null;
  
  // Core methods
  async initialize(): Promise<void>;
  async close(): Promise<void>;
  protected async navigateToPage(url: string): Promise<void>;
  protected async waitForSelector(selector: string): Promise<void>;
  protected async extractText(selector: string): Promise<string | null>;
  protected async extractAttribute(selector: string, attribute: string): Promise<string | null>;
}
```

#### BaseVendor
The `BaseVendor` class defines the interface for vendor implementations with:
- Standard methods for searching products and checking availability
- Built-in rate limiting and request throttling
- Retry mechanisms with exponential backoff
- Error handling with type categorization

```typescript
abstract class BaseVendor {
  abstract search(query: string, options?: SearchOptions): Promise<Component[]>;
  abstract getPrice(partNumber: string): Promise<ComponentPrice>;
  abstract checkStock(partNumber: string): Promise<StockInfo>;
  abstract getDetails(partNumber: string): Promise<Component>;
  
  protected async retryOperation<T>(operation: () => Promise<T>): Promise<T>;
  protected async throttleRequest(): Promise<void>;
}
```

### Vendor Implementation Example

The project includes a complete implementation for Electrokit (electrokit.com) that demonstrates:
- Product search and detail extraction
- Price and stock information handling
- Metadata extraction and normalization
- Error handling and retry logic

```typescript
export class ElektrokitScraper extends BaseScraper {
  private readonly searchUrl = 'https://www.electrokit.com/en/search/';
  
  async searchProducts(query: string, options?: SearchOptions): Promise<Component[]>;
  private async scrapeProductDetails(url: string): Promise<Component | null>;
  private async extractPriceDetails(priceText: string): Promise<ComponentPrice>;
  private async extractStockInfo(): Promise<StockInfo>;
}
```

### Recent Changes and Improvements

1. **Self-Contained Architecture**
   - Moved core scraping functionality into the project
   - Eliminated external workspace dependencies
   - Improved project portability and deployment

2. **Enhanced Error Handling**
   - Added detailed error types and messages
   - Implemented retry mechanisms with exponential backoff
   - Added screenshot capabilities for debugging

3. **Type Safety**
   - Added comprehensive TypeScript interfaces
   - Improved type checking for component data
   - Enhanced IDE support and code completion

4. **Performance Optimizations**
   - Implemented request throttling
   - Added configurable timeout settings
   - Optimized browser resource management

5. **Documentation**
   - Added detailed implementation examples
   - Improved code comments and type definitions
   - Updated setup and contribution guidelines 