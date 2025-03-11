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
├── src/                      # Frontend source code
│   ├── api/                  # API client functions
│   ├── components/           # Reusable React components
│   ├── pages/               # Page components
│   ├── types/               # Frontend TypeScript interfaces
│   ├── utils/               # Frontend utility functions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Frontend entry point
├── backend/                  # Backend application
│   ├── src/                 # Backend source code
│   │   ├── controllers/     # Request handlers
│   │   ├── lib/            # Core library code
│   │   │   ├── base/       # Base classes
│   │   │   └── scrapers/   # Scraper implementations
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/         # Backend TypeScript interfaces
│   │   ├── utils/         # Backend utility functions
│   │   ├── vendors/       # Vendor-specific implementations
│   │   └── server.ts      # Backend entry point
│   ├── tests/             # Backend tests
│   ├── tsconfig.json      # Backend TypeScript config
│   └── jest.config.js     # Backend test config
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
├── tsconfig.json           # Frontend TypeScript configuration
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

2. Install dependencies for both frontend and backend:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   # Edit both .env files with your configuration
   ```

4. Initialize the database:
   ```bash
   npm run db:init
   ```

5. Start the development servers:
   ```bash
   # In one terminal:
   npm run dev
   
   # In another terminal:
   npm run dev:backend
   ```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3000`.

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
# Build everything (frontend and backend):
npm run build:all

# Or build separately:
npm run build        # Frontend
npm run build:backend # Backend
```

The production builds will be available in the `dist` and `backend/dist` directories.

## Deployment

### Current Server Configuration

The application is currently deployed on a Linode server with the following configuration:

1. Server Details:
   - Linode instance: Nanode 1GB
   - Operating system: Ubuntu LTS
   - IP address: 172.232.134.214
   - Port: 3000

2. Installed Software:
   - Node.js and npm
   - PM2 for process management
   - Nginx as reverse proxy
   - SQLite for database storage
   - Database path: /root/app/data/component_finder.sqlite

### Manual Deployment

1. Build the application locally:
   ```bash
   npm run build
   ```

2. Create a deployment package:
   ```bash
   tar -czf deploy.tar.gz dist/ public/ package.json package-lock.json .env data/ scripts/
   ```

3. Copy the package to the Linode server:
   ```bash
   scp deploy.tar.gz root@172.232.134.214:~/app/
   ```

4. SSH into the server and deploy:
   ```bash
   ssh falk@172.232.134.214
   cd ~/app
   tar -xzf deploy.tar.gz
   npm ci --production
   pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
   ```

### Database Management

The application uses SQLite for data storage. The following scripts are available for database management:

- Initialize the database: `npm run db:init`
- Migrate data: `npm run db:migrate`
- Backup the database: `npm run db:backup`

### Server Configuration Reference

If you need to set up a new server or reinstall software, here are the configuration steps:

1. Install required software:
   ```bash
   # Update package list
   sudo apt update
   
   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2 globally
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   
   # Install SQLite
   sudo apt install -y sqlite3
   ```

2. Configure Nginx as reverse proxy:
   ```nginx
   # /etc/nginx/sites-available/electronic-components-finder
   server {
       listen 80;
       server_name 172.232.134.214;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable the Nginx site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/electronic-components-finder /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. Set up PM2 for process management:
   ```bash
   # Start the application
   pm2 start ecosystem.config.js
   
   # Enable startup script
   pm2 startup
   pm2 save
   ```

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
