# Setting Up GitHub Secrets for Deployment

This guide provides detailed instructions on how to add the required secrets to your GitHub repository for the deployment workflow.

## Required Secrets

For the deployment workflow to function correctly, you need to add the following secrets to your GitHub repository:

1. `SSH_PRIVATE_KEY`: The private SSH key for connecting to your Linode server
2. `SSH_KNOWN_HOSTS`: The SSH known hosts information for your Linode server
3. `SSH_HOST`: Your Linode server's IP address
4. `SSH_USER`: The username to use when connecting to your Linode server
5. `PORT`: The port your application will run on
6. `DB_PATH`: The path to your SQLite database on the server

## Step-by-Step Instructions

### 1. Navigate to Your Repository's Settings

1. Go to your GitHub repository: https://github.com/edwardfalk/electronics-component-finder
2. Click on the "Settings" tab in the top navigation bar
3. In the left sidebar, click on "Secrets and variables"
4. Select "Actions" from the dropdown menu

### 2. Add the SSH_PRIVATE_KEY Secret

1. Click the "New repository secret" button
2. In the "Name" field, enter `SSH_PRIVATE_KEY`
3. In the "Secret" field, paste the entire private key content:
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
   QyNTUxOQAAACDJv2J1IPEaWmzkwPBjw1r3eTUfJ1cRS0Kfd1vNS7j9nQAAAJgkBAaiJAQG
   ogAAAAtzc2gtZWQyNTUxOQAAACDJv2J1IPEaWmzkwPBjw1r3eTUfJ1cRS0Kfd1vNS7j9nQ
   AAAEDhECvlFPpK7aoxsc/Mv+s5vgzosIhxph5O3Tx9578DVMm/YnUg8RpabOTA8GPDWvd5
   NR8nVxFLQp93W81LuP2dAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
   -----END OPENSSH PRIVATE KEY-----
   ```
4. Click "Add secret"

### 3. Add the SSH_KNOWN_HOSTS Secret

1. Click the "New repository secret" button
2. In the "Name" field, enter `SSH_KNOWN_HOSTS`
3. In the "Secret" field, paste the following content:
   ```
   172.232.134.214 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
   172.232.134.214 ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7G9hPiQMQEOHJmMlHt3iSaQgX0ZJgUHSTQQXFx7TVLwXJOu0qJ9RUvuN9c7/BI9AxnCDvxzIgvVJoiR1Vcd9+nZYjy0UVQfUXYIELypTZxTOYYHJJQpyJEzQ1SFDjZgCCeI0wLYnQGDlpYYjH1McXvZ+5pYOVXMZCmyQPwkBjLZKzxV+3P1qr1ZGQIgA1Z+qB0xQfYPijBEGVxvOJASrsLHp/KYO1GXjoIbdHq6B0r8xdpk4tgYGWVcsQPJnVCKLjdqK9vPUEYxPUicCNzk4tl+CeG9R7xsLyA8sULJHBEFdQljnKsGFALlUFLK5+Ph0Q5nmXl/TGS+0yCXG8fs8uO3QiWxKRdpIgالنظام الأساسي للحكم
   ```
4. Click "Add secret"

### 4. Add the SSH_HOST Secret

1. Click the "New repository secret" button
2. In the "Name" field, enter `SSH_HOST`
3. In the "Secret" field, enter `172.232.134.214`
4. Click "Add secret"

### 5. Add the SSH_USER Secret

1. Click the "New repository secret" button
2. In the "Name" field, enter `SSH_USER`
3. In the "Secret" field, enter `root`
4. Click "Add secret"

### 6. Add the PORT Secret

1. Click the "New repository secret" button
2. In the "Name" field, enter `PORT`
3. In the "Secret" field, enter `3000`
4. Click "Add secret"

### 7. Add the DB_PATH Secret

1. Click the "New repository secret" button
2. In the "Name" field, enter `DB_PATH`
3. In the "Secret" field, enter `/root/app/data/component_finder.sqlite`
4. Click "Add secret"

## Verifying Your Secrets

After adding all the secrets, your repository should have the following secrets configured:

- `SSH_PRIVATE_KEY`
- `SSH_KNOWN_HOSTS`
- `SSH_HOST`
- `SSH_USER`
- `PORT`
- `DB_PATH`

You can verify this by checking the list of secrets on the "Actions secrets and variables" page. The secrets will be displayed with their names, but their values will be hidden for security reasons.

## Next Steps

Once you've added all the required secrets, your GitHub Actions workflow will be able to deploy your application to your Linode server whenever you push changes to the master branch.

To complete the setup, make sure you've also:

1. Added the SSH public key to your Linode server's authorized_keys file
2. Run the server setup script on your Linode server
3. Updated the Nginx configuration with your server's IP address

These steps are detailed in the main deployment guide.
