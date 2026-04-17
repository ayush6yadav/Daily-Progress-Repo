# Day 2: Advanced Apache Management & Linux Permissions

## 1. Linux User & Group Management
Apache runs as a specific user. I used these commands to audit and manage permissions:
* `ps aux | grep apache2`: Identified that the `www-data` user is running the Apache child processes.
* `ls -l /var/www/html`: Checked the current ownership of the web root.
* `sudo chown -R $USER:www-data /var/www/html`: Changed ownership to allow the current user to edit files while keeping Apache in the group.
* `sudo chmod 755 /var/www/html`: Set directory permissions (Read/Execute for all, Write for owner).

## 2. Apache Service Control & Configuration
* `sudo systemctl stop apache2`: Verified the server goes offline (Checked via browser).
* `sudo systemctl start apache2`: Brought the server back online.
* `sudo nano /etc/apache2/ports.conf`: Modified the listening port from 80 to 8080 for testing.
* `sudo apache2ctl configtest`: **Critical command** used to verify syntax before applying changes.
* `sudo systemctl reload apache2`: Applied port changes without restarting the entire process.

## 3. Network Verification (Linux)
* `netstat -tuln | grep 80`: Verified which ports the Linux OS is currently "listening" on.
* `curl -I localhost`: Used the Linux command-line tool to fetch the HTTP header from the local server.