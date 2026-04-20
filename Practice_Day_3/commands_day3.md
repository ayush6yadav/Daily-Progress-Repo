#  Day 3 — Apache Deep Dive + Linux Process & Service Management

> **5-Day Linux & Apache Training Program**
> **Author:** Ayush Yadav
> **Repo:** [Daily-Progress-Repo](https://github.com/ayush6yadav/Daily-Progress-Repo)
> **Day:** 3 of 5

---

##  Table of Contents

1. [Day 3 Goals](#-day-3-goals)
2. [Section 1: Linux Process Management](#-section-1-linux-process-management)
3. [Section 2: Systemd & Service Management](#-section-2-systemd--service-management)
4. [Section 3: Apache Virtual Hosts](#-section-3-apache-virtual-hosts)
5. [Section 4: Apache Modules & Configuration Deep Dive](#-section-4-apache-modules--configuration-deep-dive)
6. [Section 5: Apache Logs & Monitoring](#-section-5-apache-logs--monitoring)
7. [Section 6: Linux Networking Basics](#-section-6-linux-networking-basics)
8. [Practice Tasks](#-practice-tasks)
9. [Key Takeaways](#-key-takeaways)


---

##  Day 3 Goals

| # | Topic | Status |
|---|-------|--------|
| 1 | Understand Linux process lifecycle | ✅ |
| 2 | Manage services using `systemctl` | ✅ |
| 3 | Configure Apache Virtual Hosts | ✅ |
| 4 | Work with Apache modules (`mod_rewrite`, `mod_ssl`) | ✅ |
| 5 | Parse and understand Apache access/error logs | ⬜ |
| 6 | Basic Linux networking commands | ✅ |

---

##  Section 1: Linux Process Management

### What is a Process?
A **process** is any running program on a Linux system. Every process has:
- A **PID** (Process ID) — unique identifier
- A **PPID** (Parent Process ID) — the process that spawned it
- An **owner** (the user who started it)
- A **state** (running, sleeping, zombie, stopped)

### Process States

| State | Symbol | Meaning |
|-------|--------|---------|
| Running | R | Actively using CPU |
| Sleeping | S | Waiting for event/I/O |
| Disk Sleep | D | Uninterruptible sleep (I/O wait) |
| Stopped | T | Stopped by a signal |
| Zombie | Z | Finished but parent hasn't read exit code |

---

### 1.1 Viewing Processes

```bash
# Snapshot of all running processes
ps aux

# Explained:
# a = all users
# u = user-oriented format
# x = include processes without controlling terminal

# Filter by process name
ps aux | grep apache2

# Show process tree (parent-child relationships)
pstree

# Interactive real-time process viewer
top

# Better version of top (install if needed)
htop
sudo apt install htop -y
htop
```

#### Understanding `ps aux` Output
```
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 168940 13256 ?        Ss   09:00   0:02 /sbin/init
www-data  1234  0.1  0.5 456780 45678 ?        S    09:01   0:10 /usr/sbin/apache2
```
- **VSZ** = Virtual memory size
- **RSS** = Resident Set Size (actual RAM used)
- **STAT** = Process state

---

### 1.2 Finding Processes

```bash
# Find PID by name
pgrep apache2

# Find process and show full info
pgrep -la apache2

# Find PID and kill in one step
pkill apache2

# Find the PID of a process listening on port 80
sudo lsof -i :80

# Alternative: using ss (modern replacement for netstat)
sudo ss -tlnp | grep :80
```

---

### 1.3 Managing Processes — Signals

Linux communicates with processes through **signals**.

```bash
# Gracefully terminate a process (SIGTERM = 15)
kill 1234

# Force kill a process (SIGKILL = 9) — cannot be ignored
kill -9 1234

# Kill by name (graceful)
pkill apache2

# Kill by name (force)
pkill -9 apache2

# Send SIGHUP (reload config without restart)
kill -HUP 1234

# List all available signals
kill -l
```

#### Common Signals Table

| Signal | Number | Meaning |
|--------|--------|---------|
| SIGTERM | 15 | Graceful terminate (default `kill`) |
| SIGKILL | 9 | Force kill — cannot be caught |
| SIGHUP | 1 | Reload configuration |
| SIGINT | 2 | Interrupt (Ctrl+C) |
| SIGSTOP | 19 | Pause process |
| SIGCONT | 18 | Resume paused process |

---

### 1.4 Foreground & Background Jobs

```bash
# Run a command in the background
sleep 300 &

# List all background jobs
jobs

# Bring job #1 to foreground
fg %1

# Send foreground process to background (press Ctrl+Z first)
Ctrl+Z      # suspends current process
bg %1       # resume it in background

# Disown a job (keeps running even if terminal closes)
disown %1

# Run command immune to hangup (terminal close)
nohup ./my_script.sh &
```

---

### 1.5 Process Priority — `nice` & `renice`

Priority ranges from **-20 (highest)** to **19 (lowest)**. Default is 0.

```bash
# Start a process with lower priority (nice = 10)
nice -n 10 ./my_script.sh

# Start with higher priority (needs root)
sudo nice -n -5 ./important_task.sh

# Change priority of a running process
sudo renice -n 5 -p 1234

# Raise priority of apache2
sudo renice -n -5 $(pgrep apache2)
```

---

##  Section 2: Systemd & Service Management

### What is Systemd?
**systemd** is the modern init system for Linux (used in Ubuntu, CentOS, Debian, RHEL, etc.). It:
- Starts, stops, and manages services
- Handles service dependencies
- Logs everything via `journald`
- Replaces older SysV init scripts

### Key Concepts
| Term | Meaning |
|------|---------|
| **Unit** | A configuration file for a resource (service, socket, timer, etc.) |
| **Service Unit** | A `.service` file that defines a daemon/process |
| **Target** | A group of units (like runlevels in SysV) |
| **Journal** | systemd's logging system (use `journalctl`) |

---

### 2.1 Managing Services with `systemctl`

```bash
# Start a service
sudo systemctl start apache2

# Stop a service
sudo systemctl stop apache2

# Restart a service (stop + start)
sudo systemctl restart apache2

# Reload config without restart (if supported)
sudo systemctl reload apache2

# Reload OR restart (tries reload first)
sudo systemctl reload-or-restart apache2

# Enable service to start on boot
sudo systemctl enable apache2

# Disable service from starting on boot
sudo systemctl disable apache2

# Check current status of a service
sudo systemctl status apache2

# Check if service is active
sudo systemctl is-active apache2

# Check if service is enabled (starts on boot)
sudo systemctl is-enabled apache2
```

#### Reading `systemctl status` Output
```
● apache2.service - The Apache HTTP Server
     Loaded: loaded (/lib/systemd/system/apache2.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2026-04-19 09:00:00 UTC; 1h 30min ago
       Docs: https://httpd.apache.org/docs/2.4/
    Process: 1234 ExecStart=/usr/sbin/apachectl start (code=exited, status=0/SUCCESS)
   Main PID: 1235 (apache2)
      Tasks: 55
     Memory: 12.4M
     CGroup: /system.slice/apache2.service
             ├─1235 /usr/sbin/apache2 -k start
             ├─1236 /usr/sbin/apache2 -k start
             └─1237 /usr/sbin/apache2 -k start
```

---

### 2.2 System-Wide systemctl Commands

```bash
# List all loaded active services
sudo systemctl list-units --type=service

# List all services (including inactive/failed)
sudo systemctl list-units --type=service --all

# List services that failed
sudo systemctl --failed

# Check boot sequence dependencies
sudo systemctl list-dependencies apache2

# Reboot the system
sudo systemctl reboot

# Shutdown
sudo systemctl poweroff

# Show system targets (like runlevels)
sudo systemctl list-units --type=target
```

---

### 2.3 Journald — Viewing Logs

```bash
# View all logs (oldest to newest)
sudo journalctl

# View logs for apache2 only
sudo journalctl -u apache2

# Follow logs in real time (like tail -f)
sudo journalctl -u apache2 -f

# View logs from last boot only
sudo journalctl -b

# View logs from the last 1 hour
sudo journalctl --since "1 hour ago"

# View logs between two times
sudo journalctl --since "2026-04-19 09:00:00" --until "2026-04-19 10:00:00"

# View last 50 lines of apache2 logs
sudo journalctl -u apache2 -n 50

# Filter by priority (err, warning, info, debug)
sudo journalctl -u apache2 -p err
```

---

### 2.4 Writing a Custom Service Unit File

```bash
# Create a simple shell script to run as a service
sudo nano /usr/local/bin/myapp.sh
```

```bash
#!/bin/bash
# myapp.sh — simple demo app
while true; do
    echo "MyApp is running at $(date)" >> /var/log/myapp.log
    sleep 10
done
```

```bash
sudo chmod +x /usr/local/bin/myapp.sh

# Create the systemd service unit file
sudo nano /etc/systemd/system/myapp.service
```

```ini
[Unit]
Description=My Custom Demo Application
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/myapp.sh
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd to pick up the new unit file
sudo systemctl daemon-reload

# Enable and start the custom service
sudo systemctl enable myapp
sudo systemctl start myapp
sudo systemctl status myapp

# View its logs
sudo journalctl -u myapp -f
```

---

##  Section 3: Apache Virtual Hosts

### What is a Virtual Host?
A **Virtual Host** lets one Apache server serve **multiple websites** from the same machine. Two types:
- **Name-based**: Multiple domains on same IP (most common)
- **IP-based**: One IP per domain

### Apache Config File Locations (Ubuntu/Debian)

```
/etc/apache2/
├── apache2.conf          ← Main config
├── ports.conf            ← Port definitions
├── sites-available/      ← Virtual host configs (available but not active)
│   ├── 000-default.conf  ← Default site
│   └── mysite.conf       ← Your site config
├── sites-enabled/        ← Symlinks to active sites
├── mods-available/       ← All modules
├── mods-enabled/         ← Active modules (symlinks)
├── conf-available/       ← Extra config snippets
└── conf-enabled/         ← Active config snippets
```

---

### 3.1 Creating a Name-Based Virtual Host

```bash
# Step 1: Create the web root directory
sudo mkdir -p /var/www/site1.local/public_html
sudo mkdir -p /var/www/site2.local/public_html

# Step 2: Set proper ownership
sudo chown -R $USER:$USER /var/www/site1.local
sudo chown -R $USER:$USER /var/www/site2.local

# Step 3: Create test index pages
echo "<h1>Welcome to Site 1</h1>" | sudo tee /var/www/site1.local/public_html/index.html
echo "<h1>Welcome to Site 2</h1>" | sudo tee /var/www/site2.local/public_html/index.html
```

```bash
# Step 4: Create Virtual Host config for site1
sudo nano /etc/apache2/sites-available/site1.local.conf
```

```apache
<VirtualHost *:80>
    ServerName site1.local
    ServerAlias www.site1.local
    ServerAdmin webmaster@site1.local
    DocumentRoot /var/www/site1.local/public_html

    <Directory /var/www/site1.local/public_html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/site1.local-error.log
    CustomLog ${APACHE_LOG_DIR}/site1.local-access.log combined
</VirtualHost>
```

```bash
# Step 5: Create Virtual Host config for site2
sudo nano /etc/apache2/sites-available/site2.local.conf
```

```apache
<VirtualHost *:80>
    ServerName site2.local
    ServerAlias www.site2.local
    ServerAdmin webmaster@site2.local
    DocumentRoot /var/www/site2.local/public_html

    <Directory /var/www/site2.local/public_html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/site2.local-error.log
    CustomLog ${APACHE_LOG_DIR}/site2.local-access.log combined
</VirtualHost>
```

```bash
# Step 6: Enable both sites
sudo a2ensite site1.local.conf
sudo a2ensite site2.local.conf

# Step 7: Disable the default site (optional)
sudo a2dissite 000-default.conf

# Step 8: Test Apache config for syntax errors
sudo apache2ctl configtest

# Step 9: Reload Apache
sudo systemctl reload apache2

# Step 10: Add local DNS entries (for local testing)
sudo nano /etc/hosts
```

```
127.0.0.1   site1.local www.site1.local
127.0.0.1   site2.local www.site2.local
```

```bash
# Test the virtual hosts
curl http://site1.local
curl http://site2.local
```

---

### 3.2 Virtual Host Directives Reference

```apache
<VirtualHost *:80>
    # Primary domain name
    ServerName example.com

    # Alternate names that also point here
    ServerAlias www.example.com *.example.com

    # Contact email (appears in error pages)
    ServerAdmin admin@example.com

    # Root folder for this site's files
    DocumentRoot /var/www/example.com

    # Per-directory settings
    <Directory /var/www/example.com>
        Options -Indexes +FollowSymLinks   # Disable directory listing, allow symlinks
        AllowOverride All                  # Allow .htaccess files
        Require all granted                # Allow all traffic
    </Directory>

    # Custom error pages
    ErrorDocument 404 /errors/404.html
    ErrorDocument 500 /errors/500.html

    # Log files
    ErrorLog ${APACHE_LOG_DIR}/example.com-error.log
    CustomLog ${APACHE_LOG_DIR}/example.com-access.log combined
</VirtualHost>
```

---

##  Section 4: Apache Modules & Configuration Deep Dive

### 4.1 Managing Modules

```bash
# List all enabled modules
apache2ctl -M

# Enable a module
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires

# Disable a module
sudo a2dismod autoindex

# Restart Apache to apply module changes
sudo systemctl restart apache2
```

---

### 4.2 mod_rewrite — URL Rewriting

`mod_rewrite` is one of Apache's most powerful modules. It allows URL rewriting and redirects.

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### `.htaccess` file for URL rewriting

```apache
# Enable rewrite engine
RewriteEngine On

# Redirect HTTP to HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove .php extension from URLs
# /about → /about.php
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.php -f
RewriteRule ^(.+)$ $1.php [L]

# Redirect old URL to new URL
RewriteRule ^old-page$ /new-page [R=301,L]

# Block access to hidden files (starting with dot)
RewriteRule (^\.|/\.) - [F]
```

#### RewriteRule Syntax
```
RewriteRule  Pattern  Substitution  [Flags]
```

| Flag | Meaning |
|------|---------|
| `L` | Last rule — stop processing after this |
| `R=301` | Permanent redirect |
| `R=302` | Temporary redirect |
| `NC` | No Case (case-insensitive match) |
| `QSA` | Append Query String |
| `F` | Forbidden (return 403) |

---

### 4.3 mod_headers — HTTP Headers

```bash
sudo a2enmod headers
sudo systemctl restart apache2
```

```apache
# In Virtual Host or .htaccess:

# Add security headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Add Content Security Policy
Header always set Content-Security-Policy "default-src 'self'"

# Cache control for static assets
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js)$">
    Header set Cache-Control "max-age=2592000, public"
</FilesMatch>

# Remove server version from headers (security)
ServerTokens Prod
ServerSignature Off
```

---

### 4.4 mod_expires — Browser Caching

```bash
sudo a2enmod expires
sudo systemctl restart apache2
```

```apache
<IfModule mod_expires.c>
    ExpiresActive On

    # Default: 1 month
    ExpiresDefault "access plus 1 month"

    # HTML files: 1 hour
    ExpiresByType text/html "access plus 1 hour"

    # CSS and JS: 1 week
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"

    # Images: 1 month
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"

    # Fonts: 1 year
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
```

---

### 4.5 Directory Options Reference

```apache
<Directory /var/www/html>
    # Options you can set:
    Options Indexes          # Show directory listing if no index file
    Options -Indexes         # Disable directory listing (recommended)
    Options FollowSymLinks   # Follow symbolic links
    Options MultiViews       # Content negotiation
    Options ExecCGI          # Allow CGI script execution

    # AllowOverride controls what .htaccess can override
    AllowOverride None       # Ignore .htaccess files entirely
    AllowOverride All        # Allow all .htaccess directives
    AllowOverride AuthConfig # Only allow auth directives

    # Access control
    Require all granted      # Allow everyone
    Require all denied       # Deny everyone
    Require ip 192.168.1.0/24  # Allow only specific IP range
    Require host example.com   # Allow by hostname
</Directory>
```

---

##  Section 5: Apache Logs & Monitoring

### 5.1 Log File Locations

```bash
# Default log locations (Ubuntu/Debian)
/var/log/apache2/access.log     # All requests
/var/log/apache2/error.log      # All errors
/var/log/apache2/site1.local-access.log  # Virtual host specific
/var/log/apache2/site1.local-error.log   # Virtual host specific

# Real-time monitoring
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log

# Last 100 lines
sudo tail -100 /var/log/apache2/error.log
```

---

### 5.2 Understanding Access Log Format

Default **Combined Log Format**:
```
127.0.0.1 - frank [19/Apr/2026:09:00:00 +0000] "GET /index.html HTTP/1.1" 200 2326 "http://example.com/start.html" "Mozilla/5.0"
```

| Field | Value | Meaning |
|-------|-------|---------|
| Remote IP | `127.0.0.1` | Client IP address |
| Ident | `-` | RFC 1413 identity (usually `-`) |
| Auth user | `frank` | Authenticated user or `-` |
| Timestamp | `[19/Apr/2026:09:00:00 +0000]` | Date and time |
| Request | `"GET /index.html HTTP/1.1"` | Method, URI, protocol |
| Status | `200` | HTTP response code |
| Bytes | `2326` | Response size in bytes |
| Referer | `"http://example.com/..."` | Where user came from |
| User Agent | `"Mozilla/5.0"` | Browser/client info |

---

### 5.3 Analyzing Logs with Command Line

```bash
# Count total requests
wc -l /var/log/apache2/access.log

# Find all 404 errors
grep " 404 " /var/log/apache2/access.log

# Count 404 errors
grep -c " 404 " /var/log/apache2/access.log

# Find top 10 most visited URLs
awk '{print $7}' /var/log/apache2/access.log | sort | uniq -c | sort -rn | head 10

# Find top 10 IP addresses making requests
awk '{print $1}' /var/log/apache2/access.log | sort | uniq -c | sort -rn | head 10

# Find all 5xx server errors
grep " 5[0-9][0-9] " /var/log/apache2/access.log

# Find requests from a specific IP
grep "^192.168.1.100" /var/log/apache2/access.log

# Count requests per HTTP method
awk '{print $6}' /var/log/apache2/access.log | tr -d '"' | sort | uniq -c

# Find largest response sizes
awk '{print $10, $7}' /var/log/apache2/access.log | sort -rn | head 10
```

---

### 5.4 Custom Log Format

```apache
# In apache2.conf or virtual host:

# Define a custom log format named "myformat"
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\" %D" myformat

# %h = Remote host
# %l = Remote logname
# %u = Remote user
# %t = Time
# %r = Request line
# %>s = Final status code
# %b = Response bytes
# %D = Request duration in microseconds

# Use the custom format
CustomLog ${APACHE_LOG_DIR}/access.log myformat
```

---

### 5.5 Log Rotation

Apache uses **logrotate** to prevent log files from growing forever.

```bash
# View Apache's logrotate config
cat /etc/logrotate.d/apache2

# Manually trigger log rotation (for testing)
sudo logrotate -f /etc/logrotate.d/apache2

# Apache gracefully reopens log files on rotate via:
sudo systemctl reload apache2
# or
sudo kill -USR1 $(cat /var/run/apache2/apache2.pid)
```

---

##  Section 6: Linux Networking Basics

### 6.1 Checking Network Configuration

```bash
# Show all network interfaces and IPs
ip addr show
# Short form:
ip a

# Show network interfaces only
ip link show

# Show routing table
ip route show

# Show default gateway
ip route | grep default
```

---

### 6.2 Testing Connectivity

```bash
# Ping a host (ICMP)
ping google.com
ping -c 4 google.com       # Send exactly 4 packets

# Trace route to host
traceroute google.com
# or
mtr google.com             # Real-time traceroute

# DNS lookup
nslookup example.com
dig example.com
dig example.com A           # IPv4 record
dig example.com MX          # Mail records
```

---

### 6.3 Checking Ports & Connections

```bash
# List all listening ports
sudo ss -tlnp

# List all established TCP connections
sudo ss -tnp

# Check if port 80 is open and who is using it
sudo ss -tlnp | grep :80

# Alternative: lsof
sudo lsof -i :80
sudo lsof -i :443

# Check if a remote port is open
nc -zv example.com 80
nc -zv example.com 443

# Telnet test (old method)
telnet example.com 80
```

---

### 6.4 Firewall — UFW (Uncomplicated Firewall)

```bash
# Check firewall status
sudo ufw status
sudo ufw status verbose

# Enable firewall
sudo ufw enable

# Disable firewall
sudo ufw disable

# Allow HTTP (port 80)
sudo ufw allow 80/tcp
sudo ufw allow http

# Allow HTTPS (port 443)
sudo ufw allow 443/tcp
sudo ufw allow https

# Allow SSH (port 22)
sudo ufw allow 22/tcp
sudo ufw allow ssh

# Allow a specific IP
sudo ufw allow from 192.168.1.100

# Allow IP to specific port
sudo ufw allow from 192.168.1.100 to any port 80

# Deny a port
sudo ufw deny 8080

# Delete a rule
sudo ufw delete allow 8080

# View rules with numbers
sudo ufw status numbered

# Delete rule by number
sudo ufw delete 3

# Reset firewall (clears all rules)
sudo ufw reset
```

---

### 6.5 curl — Making HTTP Requests

```bash
# Simple GET request
curl http://localhost

# GET with verbose output (headers + body)
curl -v http://localhost

# Show only response headers
curl -I http://localhost

# Follow redirects
curl -L http://example.com

# POST request with data
curl -X POST -d "name=ayush&age=20" http://localhost/submit

# POST with JSON
curl -X POST -H "Content-Type: application/json" \
     -d '{"name":"ayush","age":20}' \
     http://localhost/api/users

# Save response to file
curl -o output.html http://localhost

# Custom header
curl -H "Authorization: Bearer mytoken" http://localhost/api

# Test response time
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost
```

---
---

## 💡 Key Takeaways

| Concept | Key Point |
|---------|-----------|
| **Processes** | Every running program has a PID, state, priority, and owner |
| **Signals** | `SIGTERM(15)` = graceful kill, `SIGKILL(9)` = force kill |
| **systemd** | Modern service manager; `systemctl` is your main tool |
| **journalctl** | View all system and service logs with powerful filtering |
| **Virtual Hosts** | One Apache server → multiple websites by `ServerName` |
| **a2ensite/a2dissite** | Enable/disable sites; `a2enmod/a2dismod` for modules |
| **mod_rewrite** | Powerful URL rewriting; use `.htaccess` with `AllowOverride All` |
| **Apache Logs** | Access log = all requests; Error log = problems; analyze with `awk/grep` |
| **UFW** | Simple firewall; always allow SSH before enabling! |
| **curl** | Best tool to test HTTP responses from command line |

