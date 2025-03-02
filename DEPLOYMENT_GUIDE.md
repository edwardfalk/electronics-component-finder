# Deployment Guide for Electronics Component Finder

This guide provides detailed instructions for deploying the Electronics Component Finder application to a Linode server using GitHub Actions for continuous deployment.

## Prerequisites

- A Linode account
- A GitHub account with access to the repository
- SSH key pair for secure access to your Linode server

## Step 1: Set Up a Linode Server

1. Log in to your Linode account
2. Create a new Linode instance:
   - Select a region close to your users
   - Choose "Nanode 1GB" plan (can be upgraded later if needed)
   - Select "Ubuntu 22.04 LTS" as the operating system
   - Enter a root password
   - Add your SSH key for secure access
   - Click "Create Linode"

3. Wait for your Linode to boot up (usually takes a few minutes)

4. Note your Linode's IP address from the dashboard

## Step 2: Configure DNS (Optional but Recommended)

1. If you have a domain name, set up DNS records to point to your Linode:
   - Add an A record pointing to your Linode's IP address
   - Example: `components.yourdomain.com` → `your-linode-ip`

2. Wait for DNS propagation (can take up to 24 hours)

## Step 3: Initial Server Setup

1. SSH into your Linode server:
   ```
   ssh root@your-linode-ip
   ```

2. Create a non-root user with sudo privileges:
   ```
   adduser deploy
   usermod -aG sudo deploy
   ```

3. Set up SSH for the new user:
   ```
   mkdir -p /home/deploy/.ssh
   cp ~/.ssh/authorized_keys /home/deploy/.ssh/
   chown -R deploy:deploy /home/deploy/.ssh
   chmod 700 /home/deploy/.ssh
   chmod 600 /home/deploy/.ssh/authorized_keys
   ```

4. Test SSH access with the new user:
   ```
   ssh deploy@your-linode-ip
   ```

5. Copy the server setup script to your Linode:
   ```
   scp scripts/setup-server.sh deploy@your-linode-ip:~/
   ```

6. SSH into your server with the deploy user:
   ```
   ssh deploy@your-linode-ip
   ```

7. Make the script executable and run it:
   ```
   chmod +x ~/setup-server.sh
   sudo ~/setup-server.sh
   ```

8. Update the Nginx configuration with your domain name:
   ```
   sudo nano /etc/nginx/sites-available/electronics-component-finder
   ```
   
   Change `server_name your-domain.com;` to your actual domain or IP address

9. Restart Nginx:
   ```
   sudo systemctl restart nginx
   ```

## Step 4: Set Up SSL with Let's Encrypt (Recommended)

1. Install Certbot:
   ```
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. Obtain and install SSL certificate:
   ```
   sudo certbot --nginx -d your-domain.com
   ```

3. Follow the prompts to complete the SSL setup

## Step 5: Configure GitHub Actions

1. Generate a new SSH key pair for GitHub Actions:
   ```
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions
   ```

2. Add the public key to your server:
   ```
   cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
   ```

3. Get the SSH known hosts information:
   ```
   ssh-keyscan your-linode-ip
   ```
   Copy the output for the next step

4. In your GitHub repository, go to Settings > Secrets and Variables > Actions

5. Add the following secrets:
   - `SSH_PRIVATE_KEY`: The content of `~/.ssh/github_actions` (the private key)
   - `SSH_KNOWN_HOSTS`: The output from the ssh-keyscan command
   - `SSH_HOST`: Your Linode server IP address
   - `SSH_USER`: `deploy` (or whatever username you created)
   - `PORT`: `3000` (the port your application will run on)
   - `DB_PATH`: `/home/deploy/app/data/component_finder.sqlite`

6. Create the app directory on your server:
   ```
   mkdir -p ~/app/data
   ```

## Step 6: Trigger Your First Deployment

1. Push a change to the `master` branch of your repository:
   ```
   git add .
   git commit -m "Set up deployment configuration"
   git push origin master
   ```

2. Go to the "Actions" tab in your GitHub repository to monitor the deployment

3. Once the deployment is complete, visit your domain or IP address to verify the application is running

## Troubleshooting

### Deployment Failed

1. Check the GitHub Actions logs for error messages
2. SSH into your server and check the PM2 logs:
   ```
   ssh deploy@your-linode-ip
   pm2 logs
   ```

### Application Not Accessible

1. Check if the application is running:
   ```
   pm2 status
   ```

2. Check Nginx configuration:
   ```
   sudo nginx -t
   ```

3. Check Nginx logs:
   ```
   sudo tail -f /var/log/nginx/error.log
   ```

4. Ensure firewall allows HTTP/HTTPS:
   ```
   sudo ufw status
   ```

## Maintenance

### Updating the Application

Simply push changes to the `master` branch, and GitHub Actions will automatically deploy them.

### Viewing Logs

```
ssh deploy@your-linode-ip
pm2 logs
```

### Restarting the Application

```
ssh deploy@your-linode-ip
pm2 restart electronics-component-finder
```

### Monitoring

```
ssh deploy@your-linode-ip
pm2 monit
```

## Backup Strategy

### Database Backup

1. Create a backup script on your server:
   ```
   mkdir -p ~/backups
   nano ~/backup-db.sh
   ```

2. Add the following content:
   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
   BACKUP_DIR=~/backups
   DB_PATH=~/app/data/component_finder.sqlite
   
   # Create backup
   sqlite3 $DB_PATH ".backup '$BACKUP_DIR/component_finder_$TIMESTAMP.sqlite'"
   
   # Compress backup
   gzip "$BACKUP_DIR/component_finder_$TIMESTAMP.sqlite"
   
   # Keep only the 10 most recent backups
   ls -t $BACKUP_DIR/component_finder_*.sqlite.gz | tail -n +11 | xargs -r rm
   
   echo "Backup completed: $BACKUP_DIR/component_finder_$TIMESTAMP.sqlite.gz"
   ```

3. Make the script executable:
   ```
   chmod +x ~/backup-db.sh
   ```

4. Set up a cron job to run daily backups:
   ```
   crontab -e
   ```
   
   Add the following line:
   ```
   0 2 * * * ~/backup-db.sh >> ~/backups/backup.log 2>&1
   ```

### Offsite Backups

Consider setting up rsync or rclone to copy backups to another location periodically.
