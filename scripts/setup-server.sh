#!/bin/bash
# Server setup script for electronics-component-finder
# Run this script on your Linode server to set up the environment

# Exit on error
set -e

echo "Setting up server for electronics-component-finder..."

# Update system packages
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Node.js and npm
echo "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify Node.js and npm installation
node -v
npm -v

# Install PM2 globally
echo "Installing PM2 process manager..."
npm install -g pm2

# Create application directory
echo "Creating application directory..."
mkdir -p ~/app
cd ~/app

# Set up Nginx (optional, if you want to use it as a reverse proxy)
echo "Installing and configuring Nginx..."
apt-get install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/electronics-component-finder <<EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your actual domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/electronics-component-finder /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions provided by the above command

echo "Server setup complete!"
echo "Next steps:"
echo "1. Update the Nginx configuration with your actual domain name"
echo "2. Set up SSL with Let's Encrypt (recommended)"
echo "3. Configure GitHub secrets for automated deployment"
echo "4. Push to your repository to trigger the first deployment"
