# Day 1: Linux & Apache Initial Setup

## Phase 1: Linux System Discovery
Before installation, I used these commands to audit the host environment:
* `lsb_release -a`: Verified the Linux distribution (Ubuntu 22.04 LTS).
* `uname -r`: Checked the kernel version.
* `lscpu`: Viewed CPU architecture to ensure hardware compatibility for the web server.

## Phase 2: Package Management & Installation
* `sudo apt update`: Synchronized the local package index.
* `sudo apt install apache2 -y`: Installed the Apache2 package and its dependencies.
* `apt-cache policy apache2`: Verified the specific version of Apache installed.

## Phase 3: Service Management (Systemd)
I used the Linux `systemctl` utility to control the Apache daemon:
* `sudo systemctl start apache2`: Started the service.
* `sudo systemctl status apache2`: Confirmed the service is 'active (running)'.
* `sudo systemctl enable apache2`: Set the service to persist through reboots.

## Phase 4: Basic Filesystem Tasks
* `cd /var/www/html`: Changed directory to the web root.
* `ls -la`: Listed hidden files and verified default permissions.
* `sudo mv index.html index.html.backup`: Renamed the default file using Linux move command.
* `echo "Testing Day 1" | sudo tee index.html`: Created a new test file with root privileges.