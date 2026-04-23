# 📅 Day 4 — SSL/TLS, Apache Security Hardening, Shell Scripting & Performance Tuning

> **5-Day Linux & Apache Training Program**
> **Author:** Ayush Yadav
> **Repo:** [Daily-Progress-Repo](https://github.com/ayush6yadav/Daily-Progress-Repo)
> **Day:** 4 of 5

---

## 🗂️ Table of Contents

1. [Day 4 Goals](#-day-4-goals)
2. [Section 1: SSL/TLS — HTTPS Setup](#-section-1-ssltls--https-setup)
3. [Section 2: Apache Security Hardening](#-section-2-apache-security-hardening)
4. [Section 3: Linux User & Permission Management](#-section-3-linux-user--permission-management)
5. [Section 4: Shell Scripting for Automation](#-section-4-shell-scripting-for-automation)
6. [Section 5: Apache Performance Tuning](#-section-5-apache-performance-tuning)
7. [Section 6: Cron Jobs & Task Scheduling](#-section-6-cron-jobs--task-scheduling)
8. [Practice Tasks](#-practice-tasks)
9. [Key Takeaways](#-key-takeaways)

---

## 🎯 Day 4 Goals

| # | Topic | Status |
|---|-------|--------|
| 1 | Set up SSL/TLS (self-signed + Let's Encrypt concept) | ⬜ |
| 2 | Harden Apache — hide version, disable modules, set headers | ⬜ |
| 3 | Linux user management, groups, sudo, and file permissions (ACL) | ⬜ |
| 4 | Write useful bash shell scripts for Apache automation | ⬜ |
| 5 | Tune Apache MPM (prefork/worker/event) for performance | ⬜ |
| 6 | Schedule tasks with cron and understand crontab syntax | ⬜ |

---

## 🔐 Section 1: SSL/TLS — HTTPS Setup

### What is SSL/TLS?

**SSL (Secure Sockets Layer)** and its successor **TLS (Transport Layer Security)** encrypt the communication between a browser and a web server. HTTPS = HTTP over TLS.

**Why it matters:**
- Encrypts data in transit (passwords, form data, cookies)
- Verifies server identity (prevents man-in-the-middle attacks)
- Required for modern browser trust (shows padlock 🔒)
- Boosts SEO ranking (Google ranks HTTPS higher)

### How TLS Works (Simplified)
```
Client (Browser)                    Server (Apache)
      |                                    |
      |--- ClientHello (TLS version) ----->|
      |<-- ServerHello + Certificate ------|
      |--- Verify Certificate ------------>|
      |--- Generate Session Key ---------->|
      |<========= Encrypted Data ========>|
```

---

### 1.1 Enable mod_ssl in Apache

```bash
# Enable SSL module
sudo a2enmod ssl

# Enable the default SSL site (port 443)
sudo a2ensite default-ssl

# Restart Apache to apply
sudo systemctl restart apache2

# Verify SSL module is loaded
apache2ctl -M | grep ssl
```

---

### 1.2 Create a Self-Signed Certificate (for Dev/Testing)

A self-signed certificate is free but browsers will show a warning. Good for local development.

```bash
# Create directory for SSL certificates
sudo mkdir -p /etc/ssl/mysite

# Generate a private key and self-signed certificate in one command
# -x509        = output a self-signed cert (not a CSR)
# -nodes       = no passphrase on the key (so Apache can read it)
# -days 365    = valid for 1 year
# -newkey rsa:2048 = generate a new 2048-bit RSA key
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/mysite/mysite.key \
    -out    /etc/ssl/mysite/mysite.crt \
    -subj "/C=IN/ST=Delhi/L=Delhi/O=AyushDev/CN=mysite.local"

# Set correct permissions
sudo chmod 600 /etc/ssl/mysite/mysite.key
sudo chmod 644 /etc/ssl/mysite/mysite.crt

# Verify the certificate details
sudo openssl x509 -in /etc/ssl/mysite/mysite.crt -text -noout
```

#### Understanding the OpenSSL `-subj` fields
| Field | Meaning | Example |
|-------|---------|---------|
| `C` | Country code (2 letters) | `IN` |
| `ST` | State or Province | `Delhi` |
| `L` | Locality / City | `Delhi` |
| `O` | Organisation | `AyushDev` |
| `CN` | Common Name (domain!) | `mysite.local` |

---

### 1.3 Configure Apache Virtual Host for HTTPS

```bash
sudo nano /etc/apache2/sites-available/mysite-ssl.conf
```

```apache
# HTTP → HTTPS redirect (port 80)
<VirtualHost *:80>
    ServerName mysite.local
    # Permanently redirect all HTTP traffic to HTTPS
    Redirect permanent / https://mysite.local/
</VirtualHost>

# HTTPS Virtual Host (port 443)
<VirtualHost *:443>
    ServerName mysite.local
    DocumentRoot /var/www/mysite.local/public_html

    # ── SSL Engine ──────────────────────────────────────
    SSLEngine on
    SSLCertificateFile    /etc/ssl/mysite/mysite.crt
    SSLCertificateKeyFile /etc/ssl/mysite/mysite.key

    # ── SSL Protocol & Cipher Hardening ─────────────────
    # Only allow TLS 1.2 and 1.3 (disable old SSLv3, TLS 1.0, 1.1)
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    SSLHonorCipherOrder on

    # ── HSTS (tell browser to always use HTTPS) ──────────
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

    # ── Directory ────────────────────────────────────────
    <Directory /var/www/mysite.local/public_html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # ── Logs ─────────────────────────────────────────────
    ErrorLog  ${APACHE_LOG_DIR}/mysite.local-ssl-error.log
    CustomLog ${APACHE_LOG_DIR}/mysite.local-ssl-access.log combined
</VirtualHost>
```

```bash
# Enable the SSL virtual host
sudo a2ensite mysite-ssl.conf

# Test config syntax
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2

# Verify HTTPS is working
curl -k https://mysite.local          # -k = ignore self-signed cert warning
curl -Iv https://mysite.local 2>&1 | grep -E "SSL|TLS|subject|issuer"
```

---

### 1.4 Understanding Let's Encrypt (Production SSL)

**Let's Encrypt** is a free, automated Certificate Authority. Use `certbot` for real domains.

```bash
# Install certbot for Apache
sudo apt install certbot python3-certbot-apache -y

# Obtain and install a certificate automatically
# (Only works on a real domain with DNS pointing to this server)
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal (runs twice a day via systemd timer)
sudo certbot renew --dry-run

# View scheduled renewal timer
sudo systemctl status certbot.timer

# Certificates are stored at:
ls /etc/letsencrypt/live/yourdomain.com/
# cert.pem       ← Your certificate
# chain.pem      ← Intermediate certificate chain
# fullchain.pem  ← cert.pem + chain.pem (use this in Apache)
# privkey.pem    ← Private key
```

---

### 1.5 Useful OpenSSL Commands Reference

```bash
# Check expiry date of a live SSL certificate
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null \
    | openssl x509 -noout -dates

# Check certificate on a local file
openssl x509 -in /etc/ssl/mysite/mysite.crt -noout -dates
openssl x509 -in /etc/ssl/mysite/mysite.crt -noout -subject
openssl x509 -in /etc/ssl/mysite/mysite.crt -noout -issuer

# Generate a strong Diffie-Hellman group (for Perfect Forward Secrecy)
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
# Then in Apache VHost: SSLOpenSSLConfCmd DHParameters "/etc/ssl/certs/dhparam.pem"

# Verify private key matches certificate
openssl rsa  -noout -modulus -in mysite.key | openssl md5
openssl x509 -noout -modulus -in mysite.crt | openssl md5
# Both MD5 hashes must match!
```

---

## 🛡️ Section 2: Apache Security Hardening

### 2.1 Hide Server Version and OS Info

By default Apache advertises its version and the OS. This is useful info for attackers.

```bash
# Edit main Apache config
sudo nano /etc/apache2/conf-available/security.conf
```

```apache
# Hide Apache version from headers and error pages
ServerTokens Prod          # Only shows "Apache", not version

# Hide "Apache/2.4.xx (Ubuntu)" from error pages
ServerSignature Off

# Disable TRACE method (used in XSS attacks)
TraceEnable Off
```

```bash
# Enable the security config if not already enabled
sudo a2enconf security
sudo systemctl reload apache2

# Test — should show "Server: Apache" only, no version
curl -I http://localhost | grep Server
```

---

### 2.2 Disable Directory Listing Globally

```bash
sudo nano /etc/apache2/apache2.conf
```

```apache
# Find the <Directory /var/www/> block and change Options:
<Directory /var/www/>
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

---

### 2.3 Restrict HTTP Methods

```apache
# In VirtualHost or Directory block — only allow GET, POST, HEAD
<LimitExcept GET POST HEAD>
    Require all denied
</LimitExcept>
```

---

### 2.4 Protect Against Clickjacking, XSS, MIME Sniffing

```bash
sudo a2enmod headers
```

```apache
# In apache2.conf or inside <VirtualHost>:
<IfModule mod_headers.c>
    # Prevent clickjacking
    Header always set X-Frame-Options "SAMEORIGIN"

    # Prevent MIME type sniffing
    Header always set X-Content-Type-Options "nosniff"

    # Enable XSS filter in browsers
    Header always set X-XSS-Protection "1; mode=block"

    # Control referrer info
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Content Security Policy — adjust to your needs
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'"

    # HSTS — force HTTPS for 1 year (only use once SSL is confirmed working)
    # Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

    # Remove X-Powered-By if PHP adds it
    Header always unset X-Powered-By
</IfModule>
```

---

### 2.5 Limit Request Size (Prevent Denial-of-Service)

```apache
# In apache2.conf or VirtualHost:

# Max size of HTTP request body (10 MB)
LimitRequestBody 10485760

# Max number of request header fields
LimitRequestFields 50

# Max size of a single request header field (8 KB)
LimitRequestFieldSize 8190

# Max size of request line (URL length — 8 KB)
LimitRequestLine 8190
```

---

### 2.6 Rate Limiting with mod_evasive

```bash
# Install mod_evasive (brute-force / DDoS protection)
sudo apt install libapache2-mod-evasive -y
sudo a2enmod evasive

# Configure it
sudo nano /etc/apache2/mods-available/evasive.conf
```

```apache
<IfModule mod_evasive20.c>
    DOSHashTableSize    3097
    DOSPageCount        5       # Max requests per page in DOSPageInterval
    DOSSiteCount        50      # Max requests per site in DOSSiteInterval
    DOSPageInterval     1       # Seconds
    DOSSiteInterval     1       # Seconds
    DOSBlockingPeriod   10      # Block for 10 seconds

    DOSEmailNotify      admin@example.com
    DOSLogDir           /var/log/mod_evasive
</IfModule>
```

```bash
sudo mkdir -p /var/log/mod_evasive
sudo chown www-data:www-data /var/log/mod_evasive
sudo systemctl restart apache2
```

---

### 2.7 Disable Unused Modules

Each loaded module is an attack surface. Disable what you don't need.

```bash
# List currently enabled modules
apache2ctl -M

# Disable modules you don't need (examples)
sudo a2dismod autoindex      # Directory listing
sudo a2dismod status         # Server status page (exposes info)
sudo a2dismod userdir        # /~username URLs
sudo a2dismod cgi            # CGI execution (if not using CGI)

sudo systemctl restart apache2
```

---

### 2.8 Restrict Access to Server Status (if you need it)

```apache
# Only allow status page from localhost
<Location "/server-status">
    SetHandler server-status
    Require local
    # Or: Require ip 192.168.1.0/24
</Location>
```

---

## 👤 Section 3: Linux User & Permission Management

### 3.1 User Management

```bash
# Add a new user
sudo useradd -m -s /bin/bash webdev
# -m = create home directory
# -s = set login shell

# Set password for the user
sudo passwd webdev

# Add user with comment and specific home dir
sudo useradd -m -c "Web Developer" -d /home/webdev -s /bin/bash webdev

# Modify an existing user
sudo usermod -s /bin/zsh webdev         # Change shell
sudo usermod -d /home/newdir webdev     # Change home dir
sudo usermod -l newname webdev          # Rename user
sudo usermod -L webdev                  # Lock account
sudo usermod -U webdev                  # Unlock account

# Delete a user (keep home dir)
sudo userdel webdev

# Delete user and home directory
sudo userdel -r webdev

# View user info
id webdev
cat /etc/passwd | grep webdev
finger webdev    # if installed
```

---

### 3.2 Group Management

```bash
# Create a new group
sudo groupadd webteam

# Add user to a group (supplementary)
sudo usermod -aG webteam webdev
# -a = append (don't remove from other groups)
# -G = supplementary groups

# Add user to multiple groups
sudo usermod -aG webteam,sudo,www-data webdev

# Remove user from a group
sudo gpasswd -d webdev webteam

# View all groups a user belongs to
groups webdev
id webdev

# View all groups on the system
cat /etc/group

# Change primary group of a user
sudo usermod -g webteam webdev
```

---

### 3.3 sudo Configuration

```bash
# Edit sudoers file ALWAYS with visudo (safe editor)
sudo visudo

# Add a user with full sudo access
webdev  ALL=(ALL:ALL) ALL

# Allow user to run specific commands only
webdev  ALL=(ALL) NOPASSWD: /bin/systemctl restart apache2
webdev  ALL=(ALL) NOPASSWD: /usr/sbin/apache2ctl

# Allow a group sudo access
%webteam  ALL=(ALL:ALL) ALL

# Allow group to restart specific services without password
%webteam  ALL=(ALL) NOPASSWD: /bin/systemctl restart apache2, /bin/systemctl reload apache2

# Verify sudo privileges
sudo -l -U webdev
```

---

### 3.4 File Permissions Deep Dive

```bash
# Permission format: [type][owner][group][others]
# Example: -rwxr-xr--
#   -   = regular file (d=dir, l=symlink)
#   rwx = owner can read, write, execute
#   r-x = group can read, execute
#   r-- = others can only read

# Change permissions with octal notation
chmod 755 script.sh    # rwxr-xr-x
chmod 644 index.html   # rw-r--r--
chmod 600 private.key  # rw-------
chmod 700 secret_dir/  # rwx------

# Octal quick reference:
# 4 = read (r)
# 2 = write (w)
# 1 = execute (x)
# 7 = rwx, 6 = rw-, 5 = r-x, 4 = r--, 0 = ---

# Symbolic notation
chmod u+x script.sh    # Add execute for owner
chmod g-w file.txt     # Remove write for group
chmod o=r file.txt     # Set others to read-only
chmod a+r file.txt     # Add read for all (a = ugo)
chmod u=rwx,g=rx,o=r script.sh

# Recursive permission change
chmod -R 755 /var/www/mysite/
chown -R www-data:www-data /var/www/mysite/
```

---

### 3.5 Special Permission Bits

```bash
# SetUID (SUID) — run as file owner, not the executor
chmod u+s /usr/bin/passwd   # Classic example
# Shows as: -rwsr-xr-x (s in owner execute position)

# SetGID (SGID) — new files inherit directory's group
chmod g+s /var/www/shared/
# Shows as: drwxrwsr-x
# Useful: all files created inside inherit www-data group

# Sticky bit — only owner can delete files in a directory
chmod +t /tmp
# Shows as: drwxrwxrwt
# Example: /tmp — anyone can create files, only owner can delete their own

# Octal for special bits (prepend a 4th digit)
chmod 4755 file    # SUID
chmod 2755 dir/    # SGID
chmod 1777 /tmp    # Sticky bit
```

---

### 3.6 Access Control Lists (ACL) — Fine-Grained Permissions

Standard Unix permissions only allow one owner and one group. ACLs let you give specific users/groups access without changing ownership.

```bash
# Check if ACL is supported
mount | grep acl

# Install acl tools if needed
sudo apt install acl -y

# View current ACL of a file
getfacl /var/www/mysite/

# Give user 'webdev' read+write on a specific directory
setfacl -m u:webdev:rw /var/www/mysite/
# -m = modify
# u:webdev:rw = user webdev gets rw

# Give group 'webteam' read+execute
setfacl -m g:webteam:rx /var/www/mysite/

# Apply ACL recursively
setfacl -R -m u:webdev:rwx /var/www/mysite/

# Set default ACL — new files inherit these permissions
setfacl -d -m u:webdev:rwx /var/www/mysite/

# Remove a specific ACL entry
setfacl -x u:webdev /var/www/mysite/

# Remove all ACL entries (back to standard permissions)
setfacl -b /var/www/mysite/
```

---

## 🔧 Section 4: Shell Scripting for Automation

### 4.1 Bash Script Fundamentals

```bash
#!/bin/bash
# Shebang line — tells system to use bash interpreter

# ── Variables ────────────────────────────────────────────
NAME="Ayush"
AGE=21
PI=3.14

echo "Hello, $NAME"
echo "Age: ${AGE}"       # Curly braces — best practice

# ── Read User Input ──────────────────────────────────────
read -p "Enter your name: " username
echo "Welcome, $username"

# ── Command Substitution ─────────────────────────────────
TODAY=$(date '+%Y-%m-%d')
HOSTNAME=$(hostname)
APACHE_VERSION=$(apache2 -v 2>&1 | head -1)

# ── Arithmetic ────────────────────────────────────────────
result=$((5 + 3))
result=$((10 * 4 / 2))
echo "Result: $result"

# Using bc for floating point
result=$(echo "scale=2; 22/7" | bc)
echo "Pi ≈ $result"
```

---

### 4.2 Conditionals and Comparisons

```bash
#!/bin/bash

# ── If / Elif / Else ─────────────────────────────────────
score=85

if [[ $score -ge 90 ]]; then
    echo "Grade: A"
elif [[ $score -ge 80 ]]; then
    echo "Grade: B"
elif [[ $score -ge 70 ]]; then
    echo "Grade: C"
else
    echo "Grade: F"
fi

# ── Comparison Operators ─────────────────────────────────
# Numbers:  -eq  -ne  -lt  -le  -gt  -ge
# Strings:  ==   !=   <    >   (inside [[ ]])
# Files:    -f (exists & is file)   -d (exists & is dir)
#           -r (readable)  -w (writable)  -x (executable)
#           -s (non-empty)  -z (empty string)

# Check if Apache config file exists
CONFIG="/etc/apache2/apache2.conf"
if [[ -f "$CONFIG" ]]; then
    echo "Config file found: $CONFIG"
else
    echo "Config file NOT found!"
fi

# Check if Apache is running
if systemctl is-active --quiet apache2; then
    echo "Apache is running ✅"
else
    echo "Apache is stopped ❌"
fi

# ── Case Statement ────────────────────────────────────────
read -p "Start or stop Apache? [start/stop/restart]: " action
case "$action" in
    start)   sudo systemctl start apache2 ;;
    stop)    sudo systemctl stop apache2 ;;
    restart) sudo systemctl restart apache2 ;;
    *)       echo "Unknown action: $action" ;;
esac
```

---

### 4.3 Loops

```bash
#!/bin/bash

# ── For Loop ─────────────────────────────────────────────
for i in 1 2 3 4 5; do
    echo "Item: $i"
done

# For loop with range (C-style)
for ((i=1; i<=5; i++)); do
    echo "Count: $i"
done

# For loop over files
for file in /var/www/html/*.html; do
    echo "Found: $file"
done

# ── While Loop ───────────────────────────────────────────
count=1
while [[ $count -le 5 ]]; do
    echo "Loop: $count"
    ((count++))
done

# ── Read file line by line ────────────────────────────────
while IFS= read -r line; do
    echo "Line: $line"
done < /etc/apache2/sites-enabled/000-default.conf

# ── Until Loop ───────────────────────────────────────────
num=10
until [[ $num -le 0 ]]; do
    echo "$num"
    ((num--))
done
```

---

### 4.4 Functions

```bash
#!/bin/bash

# ── Define a function ─────────────────────────────────────
greet() {
    local name="$1"          # $1 = first argument passed to function
    local greeting="Hello"
    echo "${greeting}, ${name}!"
}

# Call it
greet "Ayush"
greet "World"

# ── Function with return value ────────────────────────────
add_numbers() {
    local result=$(( $1 + $2 ))
    echo "$result"           # 'return' only works for exit codes (0-255)
}

sum=$(add_numbers 10 25)
echo "Sum: $sum"

# ── Function with exit code ───────────────────────────────
is_apache_running() {
    if systemctl is-active --quiet apache2; then
        return 0   # success / true
    else
        return 1   # failure / false
    fi
}

if is_apache_running; then
    echo "Apache is up"
else
    echo "Apache is down"
fi
```

---

### 4.5 Error Handling

```bash
#!/bin/bash

set -e          # Exit on any error
set -u          # Exit on undefined variable
set -o pipefail # Exit if any command in pipeline fails

# ── Trap errors ───────────────────────────────────────────
trap 'echo "ERROR on line $LINENO — exiting"; exit 1' ERR

# ── Check command success ─────────────────────────────────
if ! sudo apache2ctl configtest 2>/dev/null; then
    echo "Apache config has errors!"
    exit 1
fi

# ── Check exit code of last command ──────────────────────
sudo systemctl restart apache2
if [[ $? -ne 0 ]]; then
    echo "Failed to restart Apache!"
    exit 1
fi

# ── Redirect stderr ───────────────────────────────────────
command 2>/dev/null        # Suppress errors
command 2>&1               # Redirect stderr to stdout
command > output.log 2>&1  # Save both stdout and stderr to file
command &>> output.log     # Append both
```

---

## ⚡ Section 5: Apache Performance Tuning

### 5.1 MPM — Multi-Processing Modules

Apache uses an **MPM (Multi-Processing Module)** to handle concurrent connections. There are three main types:

| MPM | Best For | How it Works |
|-----|----------|--------------|
| **prefork** | Compatibility (mod_php) | One process per request, no threads |
| **worker** | High traffic, static content | Multiple threads per process |
| **event** | Best performance (default modern) | Async keep-alive connection handling |

```bash
# Check which MPM is currently active
apache2ctl -V | grep MPM
apache2ctl -M | grep mpm

# Switch MPMs
sudo a2dismod mpm_prefork
sudo a2enmod  mpm_event     # Recommended for modern Apache
sudo systemctl restart apache2
```

---

### 5.2 Tuning MPM Event (Recommended)

```bash
sudo nano /etc/apache2/mods-available/mpm_event.conf
```

```apache
<IfModule mpm_event_module>
    # Number of server processes to start
    StartServers             2

    # Minimum idle threads
    MinSpareThreads         25

    # Maximum idle threads
    MaxSpareThreads         75

    # Number of threads per process
    ThreadsPerChild         25

    # Maximum simultaneous requests (connections)
    MaxRequestWorkers      150

    # Requests per child before recycling (prevents memory leaks)
    MaxConnectionsPerChild  3000

    # Timeout for keep-alive connections (seconds)
    KeepAliveTimeout        5
</IfModule>
```

---

### 5.3 KeepAlive Settings

```bash
sudo nano /etc/apache2/apache2.conf
```

```apache
# Enable persistent connections (reuse TCP connection for multiple requests)
KeepAlive On

# Max requests on a single persistent connection
MaxKeepAliveRequests 100

# Seconds to wait for another request on same connection
KeepAliveTimeout 5
# Keep this LOW on high-traffic sites to free up connections faster
```

---

### 5.4 Enable mod_deflate (Gzip Compression)

Compress responses before sending — typically reduces size by 60-70%.

```bash
sudo a2enmod deflate
sudo systemctl reload apache2

sudo nano /etc/apache2/mods-available/deflate.conf
```

```apache
<IfModule mod_deflate.c>
    # Enable for these MIME types
    AddOutputFilterByType DEFLATE text/html text/plain text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript application/json
    AddOutputFilterByType DEFLATE image/svg+xml
    AddOutputFilterByType DEFLATE font/woff font/woff2

    # Don't compress already-compressed files
    SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png|zip|gz|bz2|rar)$ no-gzip

    # Log compression ratio (optional, for debugging)
    DeflateFilterNote ratio
    LogFormat '"%r" %b/%{ratio}n' deflate
</IfModule>
```

---

### 5.5 Enable mod_cache (Static File Caching)

```bash
sudo a2enmod cache
sudo a2enmod cache_disk
sudo systemctl restart apache2
```

```apache
# In VirtualHost or apache2.conf:
<IfModule mod_cache.c>
    CacheEnable disk /
    CacheRoot /var/cache/apache2/mod_cache_disk

    # Cache static files for 1 hour
    CacheDefaultExpire 3600
    CacheMaxExpire 86400      # Max 24 hours
    CacheIgnoreNoLastMod On

    # Don't cache authenticated pages
    CacheIgnoreCacheControl Off
</IfModule>
```

```bash
# Create cache directory
sudo mkdir -p /var/cache/apache2/mod_cache_disk
sudo chown www-data:www-data /var/cache/apache2/mod_cache_disk
```

---

### 5.6 Benchmarking Apache with ab (Apache Bench)

```bash
# Install if not already present
sudo apt install apache2-utils -y

# Basic benchmark — 1000 requests, 10 at a time
ab -n 1000 -c 10 http://localhost/

# 500 requests, 50 concurrent, with keep-alive
ab -n 500 -c 50 -k http://localhost/

# Test HTTPS endpoint (ignore cert errors)
ab -n 200 -c 20 -k https://localhost/

# Explained output:
# Requests per second  → higher = better
# Time per request     → lower = better
# Transfer rate        → throughput
# Connection Times     → min/mean/max latency
```

---

## ⏰ Section 6: Cron Jobs & Task Scheduling

### What is Cron?
**Cron** is a time-based job scheduler in Linux. It runs commands at specified intervals — perfect for backups, log rotation, certificate renewal, etc.

### 6.1 Crontab Syntax

```
# ┌──────────── Minute    (0 - 59)
# │ ┌────────── Hour      (0 - 23)
# │ │ ┌──────── Day       (1 - 31)
# │ │ │ ┌────── Month     (1 - 12)
# │ │ │ │ ┌──── Day/Week  (0 - 7)  0 and 7 = Sunday
# │ │ │ │ │
# * * * * *  command_to_run
```

### Quick Reference Table

| Expression | Meaning |
|-----------|---------|
| `* * * * *` | Every minute |
| `0 * * * *` | Every hour (at :00) |
| `0 0 * * *` | Every day at midnight |
| `0 6 * * *` | Every day at 6 AM |
| `0 0 * * 0` | Every Sunday at midnight |
| `0 0 1 * *` | First day of every month at midnight |
| `*/5 * * * *` | Every 5 minutes |
| `0 9-17 * * 1-5` | Every hour from 9-5 on weekdays |
| `@reboot` | Once on system reboot |
| `@daily` | Once per day (same as `0 0 * * *`) |
| `@weekly` | Once per week |
| `@monthly` | Once per month |

---

### 6.2 Managing Crontabs

```bash
# Edit your crontab (opens in default editor)
crontab -e

# View your crontab
crontab -l

# Remove your crontab
crontab -r

# Edit another user's crontab (as root)
sudo crontab -u webdev -e

# View root's crontab
sudo crontab -l
```

---

### 6.3 Practical Cron Job Examples

```bash
# Open crontab for editing
crontab -e
```

```cron
# ── Apache Backup every day at 2 AM ──────────────────────
0 2 * * * tar -czf /var/backups/apache2-config-$(date +\%Y\%m\%d).tar.gz /etc/apache2/ 2>/dev/null

# ── Restart Apache every Sunday at 3 AM (weekly maintenance) ──
0 3 * * 0 /bin/systemctl restart apache2

# ── Clear Apache logs older than 30 days ─────────────────
0 0 * * * find /var/log/apache2/ -name "*.log.*.gz" -mtime +30 -delete

# ── Check if Apache is running — restart if not ───────────
*/5 * * * * systemctl is-active --quiet apache2 || systemctl start apache2

# ── Renew Let's Encrypt SSL twice daily ──────────────────
0 0,12 * * * certbot renew --quiet

# ── Disk usage report every Monday at 8 AM ───────────────
0 8 * * 1 df -h / | mail -s "Disk Report $(date +\%Y-\%m-\%d)" admin@example.com

# ── Run a custom script on reboot ────────────────────────
@reboot /usr/local/bin/startup.sh >> /var/log/startup.log 2>&1
```

---

### 6.4 System-wide Cron (not per-user)

```bash
# System cron files live here:
/etc/cron.d/         # Drop-in cron files (include username field)
/etc/cron.daily/     # Scripts run daily
/etc/cron.weekly/    # Scripts run weekly
/etc/cron.monthly/   # Scripts run monthly
/etc/crontab         # System crontab (include username field)

# Example /etc/cron.d format (needs username):
# m h dom mon dow user command
  0 4 *  *   *   root  /usr/local/bin/backup.sh

# Place scripts directly in daily/weekly/monthly folders:
sudo cp my_backup.sh /etc/cron.daily/
sudo chmod +x /etc/cron.daily/my_backup.sh

# View cron logs
grep CRON /var/log/syslog
grep CRON /var/log/syslog | tail -20
```

---

## 📝 Practice Tasks

### Task 1 — Self-Signed SSL Setup

```bash
# 1. Generate certificate
sudo mkdir -p /etc/ssl/practice
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/practice/practice.key \
    -out    /etc/ssl/practice/practice.crt \
    -subj "/C=IN/ST=Delhi/L=Delhi/O=Practice/CN=practice.local"

# 2. Check cert details
sudo openssl x509 -in /etc/ssl/practice/practice.crt -noout -text | grep -E "Subject:|Not After"

# 3. Create HTTPS VHost
sudo bash -c 'cat > /etc/apache2/sites-available/practice-ssl.conf << EOF
<VirtualHost *:80>
    ServerName practice.local
    Redirect permanent / https://practice.local/
</VirtualHost>

<VirtualHost *:443>
    ServerName practice.local
    DocumentRoot /var/www/html
    SSLEngine on
    SSLCertificateFile    /etc/ssl/practice/practice.crt
    SSLCertificateKeyFile /etc/ssl/practice/practice.key
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    Header always set Strict-Transport-Security "max-age=31536000"
</VirtualHost>
EOF'

sudo a2enmod ssl headers
sudo a2ensite practice-ssl.conf
echo "127.0.0.1 practice.local" | sudo tee -a /etc/hosts
sudo apache2ctl configtest && sudo systemctl reload apache2
curl -kI https://practice.local | grep -E "HTTP|Server|Strict"
```

### Task 2 — Create a New Web User with Correct Permissions

```bash
# Create user
sudo useradd -m -s /bin/bash webdev
sudo passwd webdev

# Create group and add user
sudo groupadd webteam
sudo usermod -aG webteam,www-data webdev

# Allow user to restart Apache only
echo "webdev ALL=(ALL) NOPASSWD: /bin/systemctl restart apache2" | sudo tee /etc/sudoers.d/webdev

# Set web root permissions
sudo mkdir -p /var/www/webdev-site
sudo chown -R webdev:www-data /var/www/webdev-site
sudo chmod -R 2775 /var/www/webdev-site  # SGID so new files inherit group

# Verify
ls -la /var/www/ | grep webdev-site
sudo -l -U webdev
```

### Task 3 — Apache Health Check Cron Job

```bash
# Create health check script
sudo tee /usr/local/bin/apache_health.sh << 'EOF'
#!/bin/bash
LOG="/var/log/apache_health.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if ! systemctl is-active --quiet apache2; then
    echo "[$TIMESTAMP] Apache DOWN — attempting restart" >> "$LOG"
    systemctl start apache2
    if systemctl is-active --quiet apache2; then
        echo "[$TIMESTAMP] Apache restarted successfully" >> "$LOG"
    else
        echo "[$TIMESTAMP] Apache restart FAILED" >> "$LOG"
    fi
else
    echo "[$TIMESTAMP] Apache OK" >> "$LOG"
fi
EOF

sudo chmod +x /usr/local/bin/apache_health.sh

# Add to cron — check every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/apache_health.sh") | crontab -

# Verify cron entry
crontab -l
```

### Task 4 — Benchmark Before and After mod_deflate

```bash
# Benchmark WITHOUT compression
sudo a2dismod deflate
sudo systemctl reload apache2
ab -n 500 -c 20 http://localhost/ 2>&1 | grep -E "Requests per|Transfer rate"

# Enable compression
sudo a2enmod deflate
sudo systemctl reload apache2

# Benchmark WITH compression
ab -n 500 -c 20 http://localhost/ 2>&1 | grep -E "Requests per|Transfer rate"

# Compare Transfer rates — compressed should be significantly higher
```

---

## 💡 Key Takeaways

| Concept | Key Point |
|---------|-----------|
| **SSL/TLS** | Use `mod_ssl` + certificates; always redirect HTTP → HTTPS |
| **Self-signed cert** | Good for dev/testing; `openssl req -x509 -nodes` |
| **Let's Encrypt** | Free production SSL; `certbot --apache` handles everything |
| **ServerTokens Prod** | Hide Apache version from response headers |
| **mod_evasive** | Basic DDoS/brute-force protection at Apache level |
| **SUID/SGID/Sticky** | Special permission bits; SGID on web dirs inherits group |
| **ACL** | `setfacl` / `getfacl` for fine-grained per-user permissions |
| **MPM Event** | Best performing MPM for modern Apache with async keep-alive |
| **mod_deflate** | Gzip compression; reduces response size 60-70% |
| **ab (ApacheBench)** | Built-in load testing tool; use before/after tuning |
| **crontab** | `crontab -e` for per-user jobs; `/etc/cron.d/` for system jobs |
| **set -e / set -u** | Always use these in production shell scripts |

---

---
