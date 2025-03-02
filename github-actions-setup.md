# GitHub Actions Deployment Setup

This document provides step-by-step instructions for setting up GitHub Actions deployment to your Linode server.

## 1. SSH Key Setup

We've already generated the SSH key pair:
- Private key: `C:\Users\edwar\.ssh\github_actions`
- Public key: `C:\Users\edwar\.ssh\github_actions.pub`

## 2. Add Public Key to Linode Server

SSH into your Linode server as root (as shown in your Linode dashboard):

```bash
ssh root@172.232.134.214
```

Set up SSH for the root user:

```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key to authorized_keys
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMm/YnUg8RpabOTA8GPDWvd5NR8nVxFLQp93W81LuP2d github-actions-deploy" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Test SSH access:

```bash
ssh root@172.232.134.214
```

## 3. Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

1. `SSH_PRIVATE_KEY`: The private key content
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDJv2J1IPEaWmzkwPBjw1r3eTUfJ1cRS0Kfd1vNS7j9nQAAAJgkBAaiJAQG
ogAAAAtzc2gtZWQyNTUxOQAAACDJv2J1IPEaWmzkwPBjw1r3eTUfJ1cRS0Kfd1vNS7j9nQ
AAAEDhECvlFPpK7aoxsc/Mv+s5vgzosIhxph5O3Tx9578DVMm/YnUg8RpabOTA8GPDWvd5
NR8nVxFLQp93W81LuP2dAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE KEY-----
```

2. `SSH_KNOWN_HOSTS`: Use this value
```
172.232.134.214 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
172.232.134.214 ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7G9hPiQMQEOHJmMlHt3iSaQgX0ZJgUHSTQQXFx7TVLwXJOu0qJ9RUvuN9c7/BI9AxnCDvxzIgvVJoiR1Vcd9+nZYjy0UVQfUXYIELypTZxTOYYHJJQpyJEzQ1SFDjZgCCeI0wLYnQGDlpYYjH1McXvZ+5pYOVXMZCmyQPwkBjLZKzxV+3P1qr1ZGQIgA1Z+qB0xQfYPijBEGVxvOJASrsLHp/KYO1GXjoIbdHq6B0r8xdpk4tgYGWVcsQPJnVCKLjdqK9vPUEYxPUicCNzk4tl+CeG9R7xsLyA8sULJHBEFdQljnKsGFALlUFLK5+Ph0Q5nmXl/TGS+0yCXG8fs8uO3QiWxKRdpIgالنظام الأساسي للحكم
```

3. `SSH_HOST`: `172.232.134.214`

4. `SSH_USER`: `root`

5. `PORT`: `3000`

6. `DB_PATH`: `/root/app/data/component_finder.sqlite`

## 4. Prepare the Server

SSH into your Linode server:

```bash
ssh root@172.232.134.214
```

Create the application directory structure:

```bash
mkdir -p ~/app/data
```

## 5. Initial Server Setup

Copy the server setup script to your Linode:

```bash
scp scripts/setup-server.sh root@172.232.134.214:~/
```

SSH into your server and run the setup script:

```bash
ssh root@172.232.134.214
chmod +x ~/setup-server.sh
~/setup-server.sh  # No need for sudo when running as root
```

Update the Nginx configuration with your domain name or IP address:

```bash
sudo nano /etc/nginx/sites-available/electronics-component-finder
```

Change `server_name your-domain.com;` to `server_name 172.232.134.214;`

Restart Nginx:

```bash
sudo systemctl restart nginx
```

## 6. Trigger Deployment

Push a change to the `master` branch to trigger the GitHub Actions workflow:

```bash
git add .
git commit -m "Update configuration for deployment"
git push origin master
```

## 7. Monitor Deployment

Go to the "Actions" tab in your GitHub repository to monitor the deployment progress.

Once the deployment is complete, you can access your application at:
http://172.232.134.214
