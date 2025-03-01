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

## Deployment to Linode

### Setting Up a Linode Server

1. Create a Nanode 1GB instance on Linode
2. Choose Ubuntu LTS as the operating system
3. Set up SSH access

### Server Configuration

1. Update the system:
   ```
   sudo apt update && sudo apt upgrade -y
   ```

2. Install Node.js:
   ```
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Install PM2 for process management:
   ```
   sudo npm install -g pm2
   ```

4. Install Nginx:
   ```
   sudo apt install nginx -y
   ```

5. Configure Nginx as a reverse proxy:
   ```
   sudo nano /etc/nginx/sites-available/component-finder
   ```

   Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com;

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

6. Enable the site:
   ```
   sudo ln -s /etc/nginx/sites-available/component-finder /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Deploying the Application

1. Clone the repository on your Linode server
2. Install dependencies: `npm install`
3. Build the application: `npm run build`
4. Start with PM2: `pm2 start dist/index.js --name component-finder`
5. Set up PM2 to start on boot: `pm2 startup` and follow the instructions

## API Integration

To integrate with electronics shop APIs, you'll need to:

1. Register for API access with each retailer
2. Add your API keys to the `.env` file
3. Implement the specific API integration in the `src/services` directory

## License

MIT
