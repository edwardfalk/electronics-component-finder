# Electronic Components Finder

[![Deployment Status](https://github.com/edwardfalk/electronics-component-finder/actions/workflows/deploy.yml/badge.svg)](https://github.com/edwardfalk/electronics-component-finder/actions/workflows/deploy.yml)

> Deployed at: http://172.232.134.214
> Last test deployment: March 6, 2024

A modern web application for finding and comparing electronic components across multiple online shops, with a focus on Swedish and European retailers. The application provides a unified interface to search for components, compare prices, manage parts lists, and access datasheets.

## Features

- **Component Search**
  - Search by component name, manufacturer, or part number
  - Filter by category, shop, and stock status
  - View detailed component information including prices and availability
  - Compare prices across different shops
  - Find alternative components when items are out of stock
  - Optimize shopping carts for the best combination of price and availability

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

- **Backend**
  - Node.js with Express
  - TypeScript for type safety
  - PostgreSQL database
  - Prisma ORM
  - Centralized database on Linode

- **Web Scraping**
  - Puppeteer v22.1 for browser automation
  - Custom scraper framework for vendor-specific implementations
  - Rate limiting and retry mechanisms
  - Error handling and debugging features

## Project Structure

```
electronics-component-finder/
├── src/                      # Source code
│   ├── api/                  # API client functions
│   ├── components/           # Reusable React components
│   ├── controllers/          # Request handlers
│   ├── lib/                  # Core library code
│   │   ├── base/            # Base classes
│   │   └── scrapers/        # Scraper implementations
│   ├── models/              # Database models
│   ├── pages/               # Page components
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Utility functions
│   ├── vendors/             # Vendor-specific implementations
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                   # Frontend assets
│   ├── js/                  # Frontend JavaScript
│   ├── css/                 # Stylesheets
│   ├── datasheets/         # Stored datasheets
│   └── index.html          # Main HTML page
├── scripts/                  # Shell scripts
│   ├── schema.sql          # Database schema
│   ├── backup-db.sh        # Database backup script
│   └── setup-server.sh     # Server setup script
├── data/                    # Database and other data files
├── .env                     # Environment variables (API keys, etc.)
├── .gitignore              # Git ignore file
├── package.json            # Node.js package configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- PostgreSQL 14 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/edwardfalk/electronics-component-finder.git
   cd electronics-component-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize the database:
   ```bash
   npm run db:init
   ```

5. Start the development server:
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
