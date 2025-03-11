# Development Guide

This guide provides detailed instructions for setting up and working on the Electronic Components Finder project in a development environment.

## Development Environment Setup

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 13 or higher
- Git
- VSCode (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Jest

### Initial Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd electronic-components-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up development database:
   ```bash
   # Start PostgreSQL if not running
   sudo service postgresql start
   
   # Create database
   createdb components_finder_dev
   
   # Run migrations
   npm run db:migrate
   
   # Seed test data (optional)
   npm run db:seed
   ```

4. Configure environment:
   ```bash
   cp .env.example .env.development
   ```
   Edit `.env.development` with your local settings.

## Project Structure

```
src/
├── api/                    # API endpoints
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── routes/           # Route definitions
│   └── validators/       # Request validation
├── db/                    # Database
│   ├── migrations/       # Database migrations
│   ├── models/          # Sequelize models
│   └── seeders/         # Test data seeders
├── scrapers/             # Web scraping
│   ├── farnell/         # Farnell-specific scrapers
│   ├── common/          # Shared scraping utilities
│   └── types/           # TypeScript definitions
├── services/             # Business logic
│   ├── components/      # Component management
│   ├── prices/         # Price tracking
│   └── samples/        # Sample management
└── web/                  # Frontend
    ├── components/      # React components
    ├── hooks/          # Custom React hooks
    ├── pages/          # Page components
    └── utils/          # Frontend utilities
```

## Development Workflow

### Running the Application

1. Start development server:
   ```bash
   npm run dev
   ```
   This will start:
   - Backend API on port 3000
   - Frontend dev server on port 3001
   - Database migrations
   - TypeScript compilation in watch mode

2. Run scrapers (optional):
   ```bash
   npm run scrape:farnell
   ```

### Testing

1. Run all tests:
   ```bash
   npm test
   ```

2. Run specific test suites:
   ```bash
   npm test api        # API tests
   npm test scrapers   # Scraper tests
   npm test web        # Frontend tests
   ```

3. Run tests in watch mode:
   ```bash
   npm run test:watch
   ```

### Code Style

We use ESLint and Prettier for code formatting:

1. Check style:
   ```bash
   npm run lint
   ```

2. Fix style issues:
   ```bash
   npm run lint:fix
   ```

3. Format code:
   ```bash
   npm run format
   ```

### Database Management

1. Create migration:
   ```bash
   npm run db:migration:create name_of_migration
   ```

2. Run migrations:
   ```bash
   npm run db:migrate        # Up
   npm run db:migrate:undo   # Down
   ```

3. Create seeder:
   ```bash
   npm run db:seed:create name_of_seeder
   ```

4. Run seeders:
   ```bash
   npm run db:seed        # Run all seeders
   npm run db:seed:undo   # Undo all seeders
   ```

## Web Scraping Development

### Farnell Scraper

1. Test scraper:
   ```bash
   npm run scrape:farnell:test
   ```

2. Configure scraper:
   Edit `config/scraper.js`:
   ```javascript
   module.exports = {
     farnell: {
       baseUrl: 'https://farnell.com',
       maxPages: 10,
       requestDelay: 1000
     }
   };
   ```

3. Run with debug logging:
   ```bash
   DEBUG=scraper:* npm run scrape:farnell
   ```

### Adding New Scrapers

1. Create new scraper module:
   ```typescript
   // src/scrapers/newVendor/index.ts
   export class NewVendorScraper implements ComponentScraper {
     // Implementation
   }
   ```

2. Add configuration:
   ```javascript
   // config/scraper.js
   module.exports = {
     newVendor: {
       // Configuration
     }
   };
   ```

3. Create tests:
   ```typescript
   // tests/scrapers/newVendor.test.ts
   describe('NewVendorScraper', () => {
     // Tests
   });
   ```

## API Development

### Adding New Endpoints

1. Create controller:
   ```typescript
   // src/api/controllers/newFeature.ts
   export class NewFeatureController {
     // Implementation
   }
   ```

2. Add routes:
   ```typescript
   // src/api/routes/newFeature.ts
   router.get('/new-feature', newFeatureController.get);
   ```

3. Add validation:
   ```typescript
   // src/api/validators/newFeature.ts
   export const validateNewFeature = [
     // Validation rules
   ];
   ```

4. Add tests:
   ```typescript
   // tests/api/newFeature.test.ts
   describe('NewFeature API', () => {
     // Tests
   });
   ```

## Frontend Development

### Component Development

1. Create new component:
   ```typescript
   // src/web/components/NewComponent/index.tsx
   export const NewComponent: React.FC = () => {
     // Implementation
   };
   ```

2. Add styles:
   ```typescript
   // src/web/components/NewComponent/styles.ts
   export const Container = styled.div`
     // Styles
   `;
   ```

3. Add tests:
   ```typescript
   // src/web/components/NewComponent/index.test.tsx
   describe('NewComponent', () => {
     // Tests
   });
   ```

### State Management

We use React Query for server state and Context for local state:

1. Add query:
   ```typescript
   // src/web/hooks/useNewFeature.ts
   export const useNewFeature = () => {
     return useQuery('newFeature', fetchNewFeature);
   };
   ```

2. Add context:
   ```typescript
   // src/web/context/NewFeatureContext.tsx
   export const NewFeatureContext = createContext<NewFeatureContextType>(null);
   ```

## Debugging

### Backend Debugging

1. Start in debug mode:
   ```bash
   npm run dev:debug
   ```

2. Attach VSCode debugger using the "Attach to Process" configuration

### Frontend Debugging

1. Use React Developer Tools in browser
2. Enable source maps in development
3. Use browser console and network tab

### Scraper Debugging

1. Enable verbose logging:
   ```bash
   DEBUG=scraper:* npm run scrape:farnell
   ```

2. Use scraper test mode:
   ```bash
   npm run scrape:farnell:test
   ```

## Performance Testing

1. Run backend benchmarks:
   ```bash
   npm run benchmark
   ```

2. Profile API endpoints:
   ```bash
   npm run profile:api
   ```

3. Test scraper performance:
   ```bash
   npm run benchmark:scraper
   ```

## Documentation

### API Documentation

1. Update OpenAPI spec:
   ```bash
   npm run docs:api
   ```

2. View documentation:
   ```bash
   npm run docs:serve
   ```

### Component Documentation

1. Run Storybook:
   ```bash
   npm run storybook
   ```

2. Build documentation:
   ```bash
   npm run docs:build
   ```

## Troubleshooting

### Common Development Issues

1. **Database Connection Issues**
   - Check PostgreSQL service is running
   - Verify database exists
   - Check connection settings in .env

2. **Build Errors**
   - Clear build cache: `npm run clean`
   - Remove node_modules: `rm -rf node_modules`
   - Fresh install: `npm install`

3. **Scraper Issues**
   - Check rate limiting settings
   - Verify network connectivity
   - Check for site changes

## Best Practices

1. **Code Quality**
   - Write tests for new features
   - Follow TypeScript best practices
   - Document complex functions
   - Use meaningful variable names

2. **Git Workflow**
   - Create feature branches
   - Write clear commit messages
   - Keep PRs focused and small
   - Update documentation

3. **Performance**
   - Optimize database queries
   - Use appropriate caching
   - Monitor API response times
   - Profile slow operations 