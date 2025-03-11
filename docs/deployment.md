# Deployment Guide

This guide details the process of deploying the Electronic Components Finder to a Linode Nanode instance.

## Server Specifications

- **Server**: Linode Nanode 1GB (172.232.134.214)
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 1GB
- **Storage**: 25GB SSD
- **CPU**: 1 shared vCPU
- **Transfer**: 1TB/month

## Resource Management

Due to limited resources, we need to optimize our application:

1. **Memory Management**:
   - Limit Node.js heap size
   - Optimize PostgreSQL memory usage
   - Use PM2 for process management
   - Enable swap space

2. **Storage Considerations**:
   - Regular cleanup of old cache entries
   - Log rotation
   - Compressed backups
   - Monitor disk usage

3. **CPU Optimization**:
   - Single PM2 instance
   - Batch background tasks
   - Cache aggressively
   - Limit concurrent operations

## Prerequisites

1. Linode account and VPS setup
2. Domain name (optional)
3. SSH access to the server
4. Vendor API keys

## Initial Server Setup

1. Update system packages:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Install required system packages:
   ```bash
   sudo apt install -y curl git build-essential nginx
   ```

3. Install Node.js 18:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. Install PM2:
   ```bash
   sudo npm install -g pm2
   ```

## Swap Space Setup

1. Create swap file:
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

2. Make swap permanent:
   ```bash
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

3. Configure swappiness:
   ```bash
   echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

## PostgreSQL Setup

1. Install PostgreSQL 13:
   ```bash
   sudo apt install -y postgresql-13 postgresql-contrib-13
   ```

2. Create database and user:
   ```bash
   sudo -u postgres psql
   ```
   ```sql
   CREATE DATABASE component_finder;
   CREATE USER component_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE component_finder TO component_user;
   \q
   ```

3. Configure PostgreSQL for low memory:
   ```bash
   sudo nano /etc/postgresql/13/main/postgresql.conf
   ```
   ```ini
   # Memory Configuration
   shared_buffers = 128MB          # 25% of available RAM
   work_mem = 4MB                  # Reduced for low memory
   maintenance_work_mem = 32MB     # Reduced for low memory
   effective_cache_size = 512MB    # 50% of available RAM
   
   # Connection Settings
   max_connections = 20            # Reduced for low memory
   
   # Background Writer
   bgwriter_delay = 200ms
   bgwriter_lru_maxpages = 100
   
   # Checkpoints
   checkpoint_timeout = 30min
   checkpoint_completion_target = 0.9
   
   # Query Planning
   random_page_cost = 1.1         # Assuming SSD storage
   effective_io_concurrency = 200  # Assuming SSD storage
   ```

4. Restart PostgreSQL:
   ```bash
   sudo systemctl restart postgresql
   ```

## Node.js Configuration

1. Set Node.js memory limit:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=512"
   ```

2. Add to PM2 startup:
   ```bash
   pm2 start npm --name "component-finder" --node-args="--max-old-space-size=512" -- start
   ```

## Application Deployment

1. Clone repository:
   ```bash
   cd /opt
   sudo git clone [repository-url] electronic-components-finder
   sudo chown -R $USER:$USER electronic-components-finder
   cd electronic-components-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   nano .env
   ```
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=component_finder
   DB_USER=component_user
   DB_PASSWORD=your_secure_password

   # Cache settings
   CACHE_TTL_HOURS=24
   CACHE_REFRESH_INTERVAL=3600

   # Vendor API Keys
   ELFA_API_KEY=your_key
   ELECTROKIT_API_KEY=your_key
   MOUSER_API_KEY=your_key
   FARNELL_API_KEY=your_key
   RS_COMPONENTS_API_KEY=your_key
   DIGIKEY_API_KEY=your_key
   TME_API_KEY=your_key
   ```

4. Initialize database:
   ```bash
   npm run db:init
   ```

## Nginx Configuration

1. Create Nginx configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/component-finder
   ```
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

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

2. Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/component-finder /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## PM2 Setup

1. Start application with resource limits:
   ```bash
   pm2 start npm --name "component-finder" \
     --node-args="--max-old-space-size=512" \
     --max-memory-restart 750M \
     --instances 1 \
     -- start
   ```

2. Save PM2 configuration:
   ```bash
   pm2 save
   ```

3. Setup PM2 startup script:
   ```bash
   pm2 startup
   ```

## Log Management

1. Configure log rotation:
   ```bash
   sudo nano /etc/logrotate.d/component-finder
   ```
   ```
   /home/falk/.pm2/logs/component-finder-*.log {
       daily
       rotate 3
       compress
       delaycompress
       missingok
       notifempty
       size 10M
   }
   ```

2. Configure PM2 log rotation:
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 3
   pm2 set pm2-logrotate:compress true
   ```

## Monitoring and Maintenance

1. Monitor application logs:
   ```bash
   pm2 logs component-finder
   ```

2. Monitor database:
   ```bash
   sudo -u postgres psql -d component_finder -c "SELECT count(*) FROM components;"
   sudo -u postgres psql -d component_finder -c "SELECT count(*) FROM vendor_results;"
   ```

3. Cache management:
   ```bash
   # View cache statistics
   npm run cache:stats

   # Manual cache refresh
   npm run cache:refresh

   # Clear cache
   npm run cache:clear
   ```

4. Database backup:
   ```bash
   # Setup daily backups
   sudo nano /etc/cron.daily/backup-component-finder
   ```
   ```bash
   #!/bin/bash
   pg_dump -U component_user component_finder | gzip > /backup/component_finder_$(date +%Y%m%d).sql.gz
   ```
   ```bash
   sudo chmod +x /etc/cron.daily/backup-component-finder
   ```

## Disk Usage Monitoring

1. Set up disk space monitoring:
   ```bash
   sudo nano /etc/cron.daily/disk-monitor
   ```
   ```bash
   #!/bin/bash
   THRESHOLD=80
   USAGE=$(df -h / | grep -v Filesystem | awk '{print $5}' | tr -d '%')
   if [ $USAGE -gt $THRESHOLD ]; then
       echo "Disk usage is at ${USAGE}%" | mail -s "High Disk Usage Alert" your@email.com
   fi
   ```
   ```bash
   sudo chmod +x /etc/cron.daily/disk-monitor
   ```

2. Clean old cache entries:
   ```bash
   sudo nano /etc/cron.daily/clean-cache
   ```
   ```bash
   #!/bin/bash
   psql -U component_user -d component_finder -c "DELETE FROM vendor_results WHERE last_updated < NOW() - INTERVAL '7 days';"
   ```
   ```bash
   sudo chmod +x /etc/cron.daily/clean-cache
   ```

## Security Considerations

1. Enable firewall:
   ```bash
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

2. Set up SSL with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your_domain.com
   ```

3. Secure PostgreSQL:
   ```bash
   sudo nano /etc/postgresql/13/main/pg_hba.conf
   ```
   Ensure only local connections are allowed.

## Troubleshooting

1. Check application status:
   ```bash
   pm2 status
   pm2 logs component-finder
   ```

2. Check database connectivity:
   ```bash
   nc -zv localhost 5432
   ```

3. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   ```

4. View error logs:
   ```bash
   tail -f /var/log/nginx/error.log
   tail -f ~/.pm2/logs/component-finder-error.log
   sudo tail -f /var/log/postgresql/postgresql-13-main.log
   ``` 