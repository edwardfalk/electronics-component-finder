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

## Deployment

### Automated Deployment to Linode

This project is set up with GitHub Actions for continuous deployment to Linode.

#### Initial Server Setup

The server has been set up on Linode with the following configuration:

1. Linode instance: Nanode 1GB
2. Operating system: Ubuntu LTS
3. IP address: 172.232.134.214
4. Server setup completed with:
   - Node.js and npm
   - PM2 for process management
   - Nginx as a reverse proxy
   - SQLite for database storage

For future reference, the server setup script is available at `scripts/setup-server.sh`.

#### GitHub Actions Deployment

The project is configured with GitHub Actions for continuous deployment to Linode. The following GitHub Secrets have been set up:

- `SSH_PRIVATE_KEY`: Private SSH key for accessing the Linode server
- `SSH_KNOWN_HOSTS`: SSH known hosts information for the Linode server
- `SSH_HOST`: Linode server IP address (172.232.134.214)
- `SSH_USER`: SSH username (root)
- `PORT`: Application port (3000)
- `DB_PATH`: Path to the SQLite database (/root/app/data/component_finder.sqlite)

To deploy changes, simply push to the `master` branch. The GitHub Actions workflow will automatically build and deploy the application to the Linode server.

For detailed information about the deployment process, see the following files:
- `.github/workflows/deploy.yml`: GitHub Actions workflow configuration
- `ecosystem.config.js`: PM2 process management configuration
- `scripts/setup-server.sh`: Server setup script
- `scripts/backup-db.sh`: Database backup script
- `github-actions-setup.md`: Detailed deployment guide

#### How It Works

1. When you push to the `master` branch, GitHub Actions will:
   - Install dependencies
   - Build the TypeScript code
   - Create a deployment package
   - Copy the package to your Linode server
   - Install production dependencies
   - Start/restart the application with PM2

2. The deployment configuration uses:
   - PM2 for process management (see `ecosystem.config.js`)
   - Nginx as a reverse proxy
   - Automatic restarts if the application crashes

#### Manual Deployment

If you need to deploy manually:

1. Build the application locally:
   ```bash
   npm run build
   ```

2. Create a deployment package:
   ```bash
   tar -czf deploy.tar.gz dist/ public/ package.json package-lock.json .env data/ scripts/
   ```

3. Copy the package to your server:
   ```bash
   scp deploy.tar.gz user@your-linode-ip:~/app/
   ```

4. SSH into your server and deploy:
   ```bash
   ssh user@your-linode-ip
   cd ~/app
   tar -xzf deploy.tar.gz
   npm ci --production
   pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
   ```

#### Database Management

The application uses SQLite for data storage. The following scripts are available for database management:

- Initialize the database: `npm run db:init`
- Migrate data: `npm run db:migrate`
- Backup the database: `npm run db:backup`

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
