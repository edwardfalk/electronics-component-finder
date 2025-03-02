# Electronics Component Finder

A web application to find and compare electronic components across multiple online shops, with a focus on Swedish and European retailers.

## Features

- Search for components across multiple electronics retailers
- Compare prices and availability
- Find alternative components when items are out of stock
- Optimize shopping carts for the best combination of price and availability
- Store and access component datasheets

## Project Structure

```
electronics-component-finder/
├── src/                      # Backend source code
│   ├── routes/               # API routes
│   ├── models/               # Database models
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic
│   └── index.ts              # Main application file
├── public/                   # Frontend assets
│   ├── js/                   # Frontend JavaScript
│   ├── css/                  # Stylesheets
│   ├── datasheets/           # Stored datasheets
│   └── index.html            # Main HTML page
├── data/                     # Database and other data files
├── .env                      # Environment variables (API keys, etc.)
├── .gitignore                # Git ignore file
├── package.json              # Node.js package configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Linode account (for deployment)

### Local Development

1. Clone the repository:
   ```
   git clone <repository-url>
   cd electronics-component-finder
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

1. Build the TypeScript code:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## Automated Deployment to Linode

This project is set up with GitHub Actions for continuous deployment to Linode.

### Initial Server Setup

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

### GitHub Actions Deployment

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

### How It Works

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

### Manual Deployment

If you need to deploy manually:

1. Build the application locally: `npm run build`
2. Create a deployment package:
   ```
   tar -czf deploy.tar.gz dist/ public/ package.json package-lock.json .env data/ scripts/
   ```
3. Copy the package to your server:
   ```
   scp deploy.tar.gz user@your-linode-ip:~/app/
   ```
4. SSH into your server and deploy:
   ```
   ssh user@your-linode-ip
   cd ~/app
   tar -xzf deploy.tar.gz
   npm ci --production
   pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
   ```

## API Integration

To integrate with electronics shop APIs, you'll need to:

1. Register for API access with each retailer
2. Add your API keys to the `.env` file
3. Implement the specific API integration in the `src/services` directory

## License

MIT
