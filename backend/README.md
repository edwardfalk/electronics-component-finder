# Electronic Components Finder Backend

Backend API service for the Electronic Components Finder application, providing RESTful endpoints for component management, parts lists, and datasheets.

## Features

- **RESTful API**
  - Components search and filtering
  - Parts lists management
  - Datasheet storage and retrieval
  - Type-safe request/response handling

- **Database Integration**
  - PostgreSQL with connection pooling
  - Efficient query optimization
  - Automatic schema migrations
  - Data seeding for development

- **Development Tools**
  - TypeScript for type safety
  - Hot reloading with ts-node-dev
  - Comprehensive error handling
  - Detailed logging system

- **Security & Integration**
  - CORS configuration for frontend
  - Environment-based settings
  - Request validation
  - Error standardization

## Tech Stack

- Node.js (v18+)
- Express.js with TypeScript
- PostgreSQL 14+
- Jest for testing
- ts-node-dev for development

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── db/              # Database scripts and migrations
├── managers/        # Business logic managers
├── models/          # Data models
├── routes/          # API route definitions
├── services/        # External service integrations
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Express application setup
└── server.ts        # Server entry point
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- PostgreSQL 14 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/electronic-components-finder-backend.git
   cd electronic-components-finder-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   # Copy example configuration
   cp .env.example .env

   # Update .env with your settings
   PORT=3000
   NODE_ENV=development
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=components_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   ```

4. Set up the database:
   ```bash
   # Create database
   sudo -u postgres createdb components_db

   # Apply schema and seed data
   sudo -u postgres psql components_db -f src/db/schema.sql
   sudo -u postgres psql components_db -f src/db/seed.sql
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

The server will be available at `http://localhost:3000`.

## API Documentation

### Components

```typescript
GET /api/components
Query Parameters:
  searchTerm?: string
  category?: string
  shop?: string
  inStock?: boolean

GET /api/components/:id
Response: Component

GET /api/components/categories
Response: string[]

GET /api/components/shops
Response: string[]
```

### Parts Lists

```typescript
GET /api/parts-lists
Response: PartsList[]

POST /api/parts-lists
Body: { name: string, description?: string }
Response: PartsList

POST /api/parts-lists/:listId/components/:componentId
Body: { quantity: number }
Response: { success: boolean }

DELETE /api/parts-lists/:id
Response: { success: boolean }
```

### Datasheets

```typescript
GET /api/datasheets/component/:componentId
Response: Datasheet[]

POST /api/datasheets
Body: { componentId: string, url: string, filename: string }
Response: Datasheet

DELETE /api/datasheets/:id
Response: { success: boolean }
```

## Development Workflow

1. **Database First**: Ensure PostgreSQL is running and the database is set up
2. **Environment**: Verify `.env` configuration
3. **Development Server**: Start with `npm run dev` for hot reloading
4. **Testing**: Run tests with `npm test`

## Testing

The project includes comprehensive testing capabilities:

### End-to-End Testing
- Integration tests using Jest and Puppeteer
- BrowserManager utility for automated web interactions
- Tests run with a 30-second timeout for browser operations
- Support for both headless and non-headless modes

### BrowserManager Testing
```typescript
// Example of using BrowserManager for testing
import { BrowserManager } from '../managers/BrowserManager';

describe('Component Search', () => {
  let browser: BrowserManager;

  beforeAll(async () => {
    browser = new BrowserManager();
    await browser.initialize();
  });

  afterAll(async () => {
    await browser.cleanup();
  });

  it('should search for components', async () => {
    await browser.navigate('http://localhost:5173');
    await browser.waitForSelector('.search-input');
    // ... test implementation
  });
});
```

Key test files:
- `src/test/browser.test.ts`: End-to-end tests for frontend-backend integration
- `src/managers/BrowserManager.ts`: Browser automation utilities
- `jest.config.js`: Test configuration with extended timeout

Test configuration options:
- Non-headless mode for debugging: `HEADLESS=false npm test`
- Extended timeouts for slow operations
- Automatic test cleanup
- Screenshot capture on failure

## Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run lint` - Run ESLint

## Error Handling

The API uses standardized error responses:

```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}
```

Common HTTP status codes:
- 400: Bad Request (invalid input)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Frontend Integration

The backend is designed to work with the Material-UI based frontend. Key integration points:

- CORS enabled for frontend development server (http://localhost:5173)
- API responses formatted for Material-UI components
- Search endpoint optimized for real-time filtering
- File upload support for datasheets

## Future Deployment Plans

The application is planned to be deployed on a Linode server with the following specifications:
- Shared CPU (1 vCPU)
- 1 GB RAM
- 25 GB SSD Storage
- 1 TB Transfer
- 40 Gbps Network In
- 1000 Mbps Network Out

### Deployment Considerations
- Resource constraints require efficient database queries and connection pooling
- Memory usage should be monitored, especially for concurrent scraping operations
- Consider implementing rate limiting for API endpoints
- Cache frequently accessed data to reduce database load
- Implement proper logging for production monitoring
- Set up automated backups for the database
- Configure proper security measures (firewall rules, SSL certificates)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Acknowledgments

- Express.js team for the excellent web framework
- PostgreSQL team for the robust database
- TypeScript team for type safety
- Jest team for testing framework 