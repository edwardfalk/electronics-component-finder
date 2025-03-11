# Contributing to Electronic Components Finder

Thank you for your interest in contributing to the Electronic Components Finder project! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

1. Check if the bug has already been reported in the [Issues](https://github.com/yourusername/electronic-components-finder/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - System information

### Suggesting Enhancements

1. Check existing issues and pull requests
2. Create a new issue with:
   - Clear title and description
   - Detailed explanation of the enhancement
   - Use cases and benefits
   - Any potential drawbacks

### Pull Requests

1. Fork the repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Run tests:
   ```bash
   npm test
   ```
5. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Create a Pull Request

## Development Process

### Setting Up Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/electronic-components-finder.git
   cd electronic-components-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up development database:
   ```bash
   createdb components_finder_dev
   npm run db:migrate
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Code Style

We use ESLint and Prettier for code formatting:

1. Install editor plugins for:
   - ESLint
   - Prettier
   - EditorConfig

2. Format code before committing:
   ```bash
   npm run format
   npm run lint:fix
   ```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(api): add endpoint for component search
fix(scraper): handle rate limiting in Farnell scraper
docs(readme): update deployment instructions
```

### Testing

1. Write tests for new features
2. Update existing tests when modifying features
3. Ensure all tests pass:
   ```bash
   npm test
   ```
4. Check test coverage:
   ```bash
   npm run test:coverage
   ```

### Documentation

1. Update relevant documentation
2. Document new features
3. Update API documentation
4. Include JSDoc comments for functions

## Project Structure

```
electronic-components-finder/
├── src/                    # Source code
│   ├── api/               # API endpoints
│   ├── db/                # Database
│   ├── scrapers/          # Web scraping
│   ├── services/          # Business logic
│   └── web/               # Frontend
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── tests/                # Test files
```

### Adding New Features

1. **API Endpoints**
   - Add route in `src/api/routes/`
   - Create controller in `src/api/controllers/`
   - Add validation in `src/api/validators/`
   - Update API documentation

2. **Database Changes**
   - Create migration in `src/db/migrations/`
   - Update models in `src/db/models/`
   - Add seeds if needed in `src/db/seeders/`

3. **Web Scrapers**
   - Add scraper in `src/scrapers/`
   - Follow rate limiting guidelines
   - Add error handling
   - Include tests

4. **Frontend Components**
   - Add component in `src/web/components/`
   - Include styles and tests
   - Update documentation

## Best Practices

### Code Quality

1. **Readability**
   - Use meaningful variable names
   - Write clear comments
   - Keep functions focused
   - Follow DRY principle

2. **Error Handling**
   - Handle edge cases
   - Provide meaningful error messages
   - Log errors appropriately
   - Use try-catch blocks

3. **Performance**
   - Optimize database queries
   - Use appropriate caching
   - Monitor API response times
   - Profile slow operations

4. **Security**
   - Validate user input
   - Use parameterized queries
   - Follow security best practices
   - Keep dependencies updated

### Git Workflow

1. **Branches**
   - `main`: Production-ready code
   - `develop`: Development branch
   - Feature branches: `feature/name`
   - Bug fixes: `fix/name`

2. **Pull Requests**
   - Keep changes focused
   - Include tests
   - Update documentation
   - Add screenshots if relevant

3. **Code Review**
   - Review all changes
   - Provide constructive feedback
   - Check for security issues
   - Verify documentation

## Release Process

1. **Version Control**
   - Follow semantic versioning
   - Update CHANGELOG.md
   - Tag releases

2. **Testing**
   - Run full test suite
   - Perform manual testing
   - Check documentation
   - Verify migrations

3. **Deployment**
   - Follow deployment guide
   - Monitor for issues
   - Update documentation
   - Notify users

## Getting Help

- Check documentation
- Search existing issues
- Ask in discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 