# 📅 Day 5 — LAMP Stack, PHP, MySQL, Full Deployment & Capstone Revision

> **5-Day Linux & Apache Training Program**
> **Author:** Ayush Yadav
> **Repo:** [Daily-Progress-Repo](https://github.com/ayush6yadav/Daily-Progress-Repo)
> **Day:** 5 of 5 ✅ Final Day

---

## 🗂️ Table of Contents

1. [Day 5 Goals](#-day-5-goals)
2. [Section 1: LAMP Stack Overview](#-section-1-lamp-stack-overview)
3. [Section 2: PHP Installation & Apache Integration](#-section-2-php-installation--apache-integration)
4. [Section 3: MySQL / MariaDB — Setup & Management](#-section-3-mysql--mariadb--setup--management)
5. [Section 4: Full LAMP App Deployment](#-section-4-full-lamp-app-deployment)
6. [Section 5: System Monitoring & Diagnostics](#-section-5-system-monitoring--diagnostics)
7. [Section 6: Linux & Apache — Full 5-Day Revision](#-section-6-linux--apache--full-5-day-revision)
8. [Section 7: Capstone Project](#-section-7-capstone-project)
9. [Practice Tasks](#-practice-tasks)

---

## 🎯 Day 5 Goals

| # | Topic | Status |
|---|-------|--------|
| 1 | Install and configure the full LAMP stack | ⬜ |
| 2 | Integrate PHP with Apache (mod_php and php-fpm) | ⬜ |
| 3 | Set up MySQL/MariaDB — secure install, users, databases | ⬜ |
| 4 | Deploy a complete PHP web application end-to-end | ⬜ |
| 5 | System monitoring — htop, iotop, vmstat, netstat, sar | ⬜ |
| 6 | Full 5-day revision and capstone project | ⬜ |

---

## 🔵 Section 1: LAMP Stack Overview

### What is LAMP?

**LAMP** is the most popular open-source web stack in the world:

| Letter | Component | Role |
|--------|-----------|------|
| **L** | Linux | Operating System |
| **A** | Apache | Web Server (HTTP) |
| **M** | MySQL / MariaDB | Relational Database |
| **P** | PHP | Server-Side Scripting Language |

### How a LAMP Request Works

```
Browser Request
      │
      ▼
┌─────────────┐
│   Apache    │  ← Receives HTTP/HTTPS request on port 80/443
│  Web Server │  ← Matches Virtual Host, applies .htaccess rules
└──────┬──────┘
       │  Is it a .php file?
       ▼
┌─────────────┐
│     PHP     │  ← Processes .php file (mod_php or php-fpm)
│  Interpreter│  ← Runs business logic, queries database
└──────┬──────┘
       │  SQL query
       ▼
┌─────────────┐
│    MySQL    │  ← Returns query result rows to PHP
│  Database   │
└──────┬──────┘
       │  HTML generated
       ▼
┌─────────────┐
│   Browser   │  ← Receives final rendered HTML
└─────────────┘
```

### mod_php vs php-fpm

| Feature | mod_php | php-fpm (FastCGI) |
|---------|---------|-------------------|
| How it works | PHP embedded inside Apache process | PHP runs as a separate process pool |
| Performance | Good for small/medium sites | Better for high-traffic production |
| Memory | Shared with Apache worker | Independent, more controllable |
| MPM compatibility | Only prefork MPM | Works with worker and event MPM |
| Per-site config | Same php.ini for all sites | Can set pool per VirtualHost |
| Recommended for | Simple setups, dev | Production, multiple sites |

---

## 🟢 Section 2: PHP Installation & Apache Integration

### 2.1 Install PHP

```bash
# Update package list
sudo apt update

# Install PHP (latest available)
sudo apt install php -y

# Install a specific version
sudo apt install php8.2 -y

# Check installed version
php --version
php -v

# Install the most common PHP extensions
sudo apt install php-mysql php-curl php-gd php-mbstring \
    php-xml php-xmlrpc php-soap php-intl php-zip \
    php-bcmath php-json php-opcache -y

# List all currently loaded PHP extensions
php -m

# List all available PHP packages
apt-cache search "^php" | sort
```

---

### 2.2 Method 1: mod_php (Simple — Apache handles PHP directly)

```bash
# Install the mod_php Apache module
sudo apt install libapache2-mod-php -y

# Verify it got enabled
apache2ctl -M | grep php

# Test PHP works
echo "<?php phpinfo(); ?>" | sudo tee /var/www/html/info.php
curl -s http://localhost/info.php | grep -i "PHP Version"

# IMPORTANT: Delete info.php after testing — it exposes server info!
sudo rm /var/www/html/info.php
```

---

### 2.3 Method 2: PHP-FPM (Production — FastCGI Process Manager)

```bash
# Install PHP-FPM
sudo apt install php-fpm -y

# Check what version was installed
php-fpm8.2 --version    # adjust version number

# Enable required Apache proxy modules
sudo a2enmod proxy_fcgi setenvif

# Enable the PHP-FPM Apache config snippet
sudo a2enconf php8.2-fpm   # adjust version

# Start and enable PHP-FPM
sudo systemctl start  php8.2-fpm
sudo systemctl enable php8.2-fpm
sudo systemctl status php8.2-fpm

# Reload Apache
sudo systemctl reload apache2

# Verify FPM socket exists
ls -la /run/php/php8.2-fpm.sock
```

#### FPM Virtual Host Configuration

```apache
<VirtualHost *:80>
    ServerName myapp.local
    DocumentRoot /var/www/myapp/public

    # Route ALL .php files through the PHP-FPM Unix socket
    <FilesMatch \.php$>
        SetHandler "proxy:unix:/run/php/php8.2-fpm.sock|fcgi://localhost/"
    </FilesMatch>

    <Directory /var/www/myapp/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog  ${APACHE_LOG_DIR}/myapp-error.log
    CustomLog ${APACHE_LOG_DIR}/myapp-access.log combined
</VirtualHost>
```

---

### 2.4 PHP Configuration — php.ini

```bash
# Find which php.ini is being used by Apache
php --ini | grep "Loaded Configuration"

# php.ini locations by context:
#   mod_php (Apache) : /etc/php/8.2/apache2/php.ini
#   php-fpm          : /etc/php/8.2/fpm/php.ini
#   CLI              : /etc/php/8.2/cli/php.ini

sudo nano /etc/php/8.2/apache2/php.ini
```

#### Key php.ini Settings

```ini
; ── Resource Limits ──────────────────────────────────────
max_execution_time = 30         ; Max script run time (seconds)
max_input_time = 60             ; Max time to parse request input
memory_limit = 256M             ; Max RAM per PHP script

; ── File Uploads ─────────────────────────────────────────
file_uploads = On
upload_max_filesize = 64M       ; Max single file size
post_max_size = 64M             ; Max total POST body
max_file_uploads = 20

; ── Error Handling (PRODUCTION) ──────────────────────────
display_errors = Off            ; Never show errors to browser
log_errors = On                 ; Always log errors to file
error_log = /var/log/php/error.log
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT

; ── Error Handling (DEVELOPMENT) ─────────────────────────
; display_errors = On
; error_reporting = E_ALL

; ── Security Settings ────────────────────────────────────
expose_php = Off                ; Don't show PHP version in headers
allow_url_fopen = Off           ; Disable remote URL reads
allow_url_include = Off         ; Disable remote includes (critical!)
session.cookie_httponly = 1     ; Block JS from reading session cookie
session.cookie_secure = 1       ; Send cookie only over HTTPS
session.use_strict_mode = 1     ; Prevent session fixation

; ── OPcache (Performance) ────────────────────────────────
opcache.enable = 1
opcache.memory_consumption = 128
opcache.max_accelerated_files = 10000
opcache.revalidate_freq = 2
```

```bash
# After editing, restart Apache (or FPM)
sudo systemctl restart apache2
# For FPM:
sudo systemctl restart php8.2-fpm

# Verify a setting from the command line
php -r "echo ini_get('memory_limit') . PHP_EOL;"
php -r "echo ini_get('upload_max_filesize') . PHP_EOL;"
```

---

### 2.5 Useful PHP CLI Commands

```bash
# Run a PHP script
php script.php

# Run inline code
php -r "echo PHP_VERSION . PHP_EOL;"
php -r "var_dump(extension_loaded('pdo_mysql'));"

# Syntax check without executing
php -l script.php

# Interactive PHP shell (REPL)
php -a

# Built-in development server (NOT for production)
php -S localhost:8080 -t /var/www/html/

# Show all loaded settings
php --ini
php -i | grep -i "max_execution"

# List compiled-in extensions
php -m | sort
```

---

## 🟠 Section 3: MySQL / MariaDB — Setup & Management

### What is MariaDB?

**MariaDB** is a community-driven fork of MySQL — 100% compatible with MySQL syntax and drivers, and the default database server in Ubuntu/Debian repositories.

```bash
# Install MariaDB server and client
sudo apt install mariadb-server mariadb-client -y

# Start and enable
sudo systemctl start  mariadb
sudo systemctl enable mariadb
sudo systemctl status mariadb

# Verify version
mysql --version
mysqladmin version
```

---

### 3.1 Secure Installation (Run After Fresh Install)

```bash
sudo mysql_secure_installation
```

It will prompt you:

| Question | Answer |
|----------|--------|
| Enter current root password | Press Enter (blank) |
| Set root password? | Y — set a strong password |
| Remove anonymous users? | Y |
| Disallow root login remotely? | Y |
| Remove test database? | Y |
| Reload privilege tables? | Y |

---

### 3.2 Connecting to MariaDB

```bash
# Connect as root via socket (no password needed with sudo)
sudo mysql

# Connect as root with password prompt
mysql -u root -p

# Connect to a specific database directly
mysql -u root -p myapp_db

# Connect to a remote host
mysql -u webuser -p -h 192.168.1.100 -P 3306 myapp_db

# Run a single SQL command from shell (non-interactive)
sudo mysql -e "SHOW DATABASES;"
mysql -u webuser -pYourPass myapp_db -e "SELECT COUNT(*) FROM users;"

# Pipe a SQL file into mysql
mysql -u root -p myapp_db < setup.sql

# Exit MariaDB shell
EXIT;      # or \q or Ctrl+D
```

---

### 3.3 Database Operations

```sql
-- Show all databases
SHOW DATABASES;

-- Create a database (with best-practice charset)
CREATE DATABASE myapp_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Select / use a database
USE myapp_db;

-- Show which database is active
SELECT DATABASE();

-- Drop a database (IRREVERSIBLE — be careful!)
DROP DATABASE myapp_db;

-- Show all tables in current database
SHOW TABLES;

-- Describe a table's columns
DESCRIBE users;
SHOW CREATE TABLE users\G

-- Show table sizes
SELECT
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'myapp_db'
ORDER BY (data_length + index_length) DESC;
```

---

### 3.4 Table & Data Operations

```sql
-- ── CREATE TABLE ─────────────────────────────────────────
CREATE TABLE users (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100),
    role        ENUM('admin', 'editor', 'user') DEFAULT 'user',
    is_active   TINYINT(1)   DEFAULT 1,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP
);

-- ── INSERT ───────────────────────────────────────────────
INSERT INTO users (username, email, password, full_name, role)
VALUES ('ayush', 'ayush@example.com', SHA2('pass123', 256), 'Ayush Yadav', 'admin');

-- Insert multiple rows at once
INSERT INTO users (username, email, password, full_name) VALUES
    ('alice', 'alice@example.com', SHA2('pass1', 256), 'Alice Smith'),
    ('bob',   'bob@example.com',   SHA2('pass2', 256), 'Bob Jones'),
    ('carol', 'carol@example.com', SHA2('pass3', 256), 'Carol White');

-- ── SELECT ───────────────────────────────────────────────
SELECT * FROM users;
SELECT id, username, email, role FROM users;
SELECT * FROM users WHERE role = 'admin';
SELECT * FROM users WHERE is_active = 1 ORDER BY created_at DESC LIMIT 10;

-- Count rows
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM users WHERE role = 'admin';

-- ── UPDATE ───────────────────────────────────────────────
UPDATE users SET role = 'editor' WHERE username = 'alice';
UPDATE users SET is_active = 0 WHERE id = 3;
-- ALWAYS use WHERE in UPDATE or you update every row!

-- ── DELETE ───────────────────────────────────────────────
DELETE FROM users WHERE id = 3;
-- ALWAYS use WHERE in DELETE!

-- ── ALTER TABLE ──────────────────────────────────────────
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;
ALTER TABLE users MODIFY COLUMN full_name VARCHAR(150) NOT NULL;
ALTER TABLE users DROP COLUMN last_login;
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users RENAME TO app_users;
```

---

### 3.5 User Management & Privileges

```sql
-- Show all users
SELECT User, Host, plugin FROM mysql.user;

-- Create a user (localhost only — most secure for web apps)
CREATE USER 'webuser'@'localhost' IDENTIFIED BY 'StrongPass@123!';

-- Create user accessible from anywhere (less secure — use with firewall)
CREATE USER 'webuser'@'%' IDENTIFIED BY 'StrongPass@123!';

-- Grant all privileges on one database
GRANT ALL PRIVILEGES ON myapp_db.* TO 'webuser'@'localhost';

-- Grant read-only (reporting/analytics user)
GRANT SELECT ON myapp_db.* TO 'readuser'@'localhost';

-- Grant specific privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON myapp_db.* TO 'webuser'@'localhost';

-- Apply changes immediately
FLUSH PRIVILEGES;

-- Show what privileges a user has
SHOW GRANTS FOR 'webuser'@'localhost';

-- Revoke a privilege
REVOKE DELETE ON myapp_db.* FROM 'webuser'@'localhost';

-- Change a user's password
ALTER USER 'webuser'@'localhost' IDENTIFIED BY 'NewPass@2026!';
FLUSH PRIVILEGES;

-- Delete a user
DROP USER 'webuser'@'localhost';
```

---

### 3.6 Backup & Restore

```bash
# ── Backup ───────────────────────────────────────────────

# Backup a single database
mysqldump -u root -p myapp_db > myapp_db_backup.sql

# Backup with gzip compression
mysqldump -u root -p myapp_db | gzip > myapp_db_$(date +%Y%m%d_%H%M).sql.gz

# Backup all databases
mysqldump -u root -p --all-databases > all_databases.sql

# Backup structure only (no data — for schema)
mysqldump -u root -p --no-data myapp_db > myapp_db_schema.sql

# Backup data only (no CREATE TABLE statements)
mysqldump -u root -p --no-create-info myapp_db > myapp_db_data.sql

# Backup specific tables
mysqldump -u root -p myapp_db users contacts > specific_tables.sql

# ── Restore ──────────────────────────────────────────────

# Restore into an existing database
mysql -u root -p myapp_db < myapp_db_backup.sql

# Restore from compressed backup
gunzip < myapp_db_20260427.sql.gz | mysql -u root -p myapp_db

# Create database then restore
mysql -u root -p -e "CREATE DATABASE myapp_db CHARACTER SET utf8mb4;"
mysql -u root -p myapp_db < myapp_db_backup.sql
```

---

### 3.7 MariaDB Configuration

```bash
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

```ini
[mysqld]
# ── Networking ───────────────────────────────────────────
bind-address        = 127.0.0.1   # LOCAL ONLY — critical security setting
port                = 3306

# ── Performance ──────────────────────────────────────────
innodb_buffer_pool_size  = 256M   # Set to ~70% of RAM on DB-only servers
max_connections          = 150    # Max simultaneous client connections
query_cache_size         = 64M
query_cache_type         = 1

# ── Logging ──────────────────────────────────────────────
general_log              = 0      # Off in production
slow_query_log           = 1      # Log slow queries
slow_query_log_file      = /var/log/mysql/slow.log
long_query_time          = 2      # Log queries that take > 2 seconds

# ── Character Set ────────────────────────────────────────
character-set-server     = utf8mb4
collation-server         = utf8mb4_unicode_ci
```

```bash
sudo systemctl restart mariadb

# Check MariaDB error log
sudo tail -f /var/log/mysql/error.log

# Check slow query log
sudo tail -f /var/log/mysql/slow.log
```

---

## 🔴 Section 4: Full LAMP App Deployment

### 4.1 PHP + MySQL Connection with PDO (Best Practice)

```php
<?php
// config/db.php — Database connection file

define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'myapp_db');
define('DB_USER', 'webuser');
define('DB_PASS', 'StrongPass@123!');
define('DB_PORT', '3306');

function getDB(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;port=%s;charset=utf8mb4',
            DB_HOST, DB_NAME, DB_PORT
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,  // Real prepared statements
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Log the real error, show generic message to user
            error_log('DB Error: ' . $e->getMessage());
            die('Database unavailable. Please try again later.');
        }
    }

    return $pdo;
}
```

#### SAFE vs UNSAFE SQL (Critical Security Concept)

```php
<?php
require_once 'config/db.php';
$db = getDB();

// ────────────────────────────────────────────────────────────
// ❌ UNSAFE — SQL Injection vulnerability!
// NEVER do this:
$username = $_GET['username'];
$sql = "SELECT * FROM users WHERE username = '$username'";
// Attacker enters: ' OR '1'='1  → dumps entire table!

// ────────────────────────────────────────────────────────────
// ✅ SAFE — PDO Prepared Statements
// Always use ? or :name placeholders:
$username = $_GET['username'] ?? '';

$stmt = $db->prepare("SELECT id, username, email, role
                       FROM users
                       WHERE username = :username AND is_active = 1");
$stmt->execute([':username' => $username]);
$user = $stmt->fetch();

if ($user) {
    echo "Welcome, " . htmlspecialchars($user['username']);
} else {
    echo "User not found.";
}

// ────────────────────────────────────────────────────────────
// Fetching multiple rows
$stmt = $db->prepare("SELECT * FROM users WHERE role = ? ORDER BY created_at DESC");
$stmt->execute(['admin']);
$admins = $stmt->fetchAll();  // Returns array of all matching rows

foreach ($admins as $admin) {
    echo htmlspecialchars($admin['username']) . '<br>';
}

// ────────────────────────────────────────────────────────────
// INSERT with prepared statement
$stmt = $db->prepare(
    "INSERT INTO users (username, email, password) VALUES (:u, :e, :p)"
);
$stmt->execute([
    ':u' => 'newuser',
    ':e' => 'new@example.com',
    ':p' => password_hash('secret123', PASSWORD_BCRYPT),
]);
$newId = $db->lastInsertId();
echo "Created user ID: $newId";
```

---

### 4.2 Apache VHost for a PHP App

```bash
# Create the project structure
sudo mkdir -p /var/www/myapp/{public_html,config,includes,logs}
sudo chown -R $USER:www-data /var/www/myapp
sudo chmod -R 2755 /var/www/myapp    # SGID so new files inherit www-data group
sudo chmod 700 /var/www/myapp/config  # Config dir: owner only

# Create VHost
sudo tee /etc/apache2/sites-available/myapp.conf << 'EOF'
<VirtualHost *:80>
    ServerName myapp.local
    DocumentRoot /var/www/myapp/public_html

    <Directory /var/www/myapp/public_html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Block access to config and includes directories
    <Directory /var/www/myapp/config>
        Require all denied
    </Directory>
    <Directory /var/www/myapp/includes>
        Require all denied
    </Directory>

    ErrorLog  ${APACHE_LOG_DIR}/myapp-error.log
    CustomLog ${APACHE_LOG_DIR}/myapp-access.log combined
</VirtualHost>
EOF

sudo a2ensite myapp.conf
echo "127.0.0.1 myapp.local" | sudo tee -a /etc/hosts
sudo apache2ctl configtest && sudo systemctl reload apache2
```

---

## 🟡 Section 5: System Monitoring & Diagnostics

### 5.1 htop — Interactive Process Viewer

```bash
sudo apt install htop -y
htop
```

| Key | Action |
|-----|--------|
| `F2` | Setup / customise columns |
| `F3` | Search for process |
| `F4` | Filter processes |
| `F5` | Toggle tree view |
| `F6` | Sort by column |
| `F9` | Kill selected process |
| `u` | Filter by user |
| `P` | Sort by CPU % |
| `M` | Sort by Memory % |
| `T` | Sort by Time |
| `q` | Quit |

---

### 5.2 iotop — Disk I/O Monitor

```bash
sudo apt install iotop -y

# Show all processes with I/O stats
sudo iotop

# Show only processes with ACTIVE I/O (cleaner view)
sudo iotop -o

# Batch / non-interactive mode (for scripts)
sudo iotop -b -n 3        # 3 snapshots then exit
sudo iotop -b -n 1 -o -q  # One quiet snapshot, active I/O only
```

---

### 5.3 vmstat — Virtual Memory & System Stats

```bash
# One-time snapshot
vmstat

# Every 2 seconds, 5 times
vmstat 2 5

# vmstat output column meanings:
# procs:   r = runnable queue, b = blocked
# memory:  swpd = swap used, free = free RAM (bytes)
#          buff = buffers, cache = page cache
# swap:    si = swap in/s, so = swap out/s (non-zero = low RAM!)
# io:      bi = blocks in/s (reads), bo = blocks out/s (writes)
# system:  in = interrupts/s, cs = context switches/s
# cpu:     us = user%, sy = system%, id = idle%, wa = iowait%

# Memory statistics
vmstat -s

# Disk statistics
vmstat -d

# Watch for memory pressure
vmstat 1 | awk '$7 > 0 {print "SWAP OUT:", $7, "blocks/s"}'
```

---

### 5.4 iostat — CPU & Disk I/O Statistics

```bash
# Install sysstat (includes iostat, sar, mpstat)
sudo apt install sysstat -y

# Basic report
iostat

# Continuous — every 2 seconds
iostat 2

# Extended output — full disk metrics
iostat -x 2

# Key iostat -x columns:
# %util  → Disk busy % (close to 100% = bottleneck)
# await  → Average ms per I/O request (lower is better)
# r/s    → Reads per second
# w/s    → Writes per second
# rkB/s  → Read KB per second
# wkB/s  → Write KB per second
```

---

### 5.5 ss and netstat — Network Connections

```bash
# Modern: ss (Socket Statistics — replaces netstat)

# Listening TCP ports with process names
sudo ss -tlnp

# All established TCP connections
sudo ss -tnp

# UDP listening ports
sudo ss -ulnp

# Summary statistics
ss -s

# Filter by specific port
sudo ss -tnp | grep :80
sudo ss -tnp | grep :3306      # Check MySQL is only listening locally

# Legacy netstat (install net-tools if needed)
sudo apt install net-tools -y
sudo netstat -tlnp             # Listening TCP
sudo netstat -tnp              # Established connections
sudo netstat -s                # Full statistics
sudo netstat -r                # Routing table
```

---

### 5.6 sar — System Activity Reporter

```bash
# Enable sysstat service
sudo systemctl enable --now sysstat

# Allow data collection
sudo nano /etc/default/sysstat
# Set: ENABLED="true"
sudo systemctl restart sysstat

# View CPU usage (today)
sar

# CPU every 1 second, 5 samples
sar 1 5

# Memory stats
sar -r

# Disk I/O per device
sar -d

# Network stats per interface
sar -n DEV

# View historical report (yesterday's data)
sar -f /var/log/sysstat/sa$(date -d yesterday '+%d')

# All stats for a specific time range
sar -A --start 09:00:00 --end 11:00:00
```

---

### 5.7 df, du, free — Disk and Memory

```bash
# ── Disk ──────────────────────────────────────────────────
df -h                          # Human-readable disk usage per filesystem
df -i                          # Inode usage (important for many-small-files)
df -h /var/www /etc/apache2    # Specific paths only

du -sh /var/www/html/          # Size of a specific directory
du -sh /var/log/apache2/       # Apache log directory size
du -h --max-depth=1 /var/www/  # Size of each item inside /var/www
du -h /var/ 2>/dev/null | sort -rh | head 15  # Top 15 largest in /var

# ── Memory ────────────────────────────────────────────────
free -h                        # Human-readable memory + swap summary
free -m                        # In megabytes
cat /proc/meminfo              # Raw memory details
watch -n2 free -h              # Live memory — refresh every 2 seconds

# ── Uptime and load ───────────────────────────────────────
uptime                         # Uptime + load averages
uptime -p                      # Pretty format: "up 2 days, 3 hours"
w                              # Logged-in users + their load impact
```

---

### 5.8 dmesg and journalctl for Diagnostics

```bash
# Kernel ring buffer (hardware events, boot messages, OOM killer)
dmesg
dmesg | tail -30
dmesg -T                       # Human-readable timestamps
dmesg --level=err,warn         # Errors and warnings only
dmesg | grep -i "oom"          # Check for Out-Of-Memory kills
dmesg | grep -i "error"

# systemd journal — full structured system log
sudo journalctl                # All logs (oldest first)
sudo journalctl -xe            # Latest entries + explanations
sudo journalctl -b             # Only this boot session
sudo journalctl -p err         # Error level and above only
sudo journalctl -u apache2     # Apache2 logs only
sudo journalctl -u apache2 -f  # Follow Apache logs live
sudo journalctl -u mariadb -n 50  # Last 50 MariaDB log entries
sudo journalctl --since "2 hours ago"
sudo journalctl --since "2026-04-27 09:00" --until "2026-04-27 10:00"

# Disk space used by journal
sudo journalctl --disk-usage

# Vacuum old logs (keep only last 2 weeks)
sudo journalctl --vacuum-time=2weeks
```

---

## 📖 Section 6: Linux & Apache — Full 5-Day Revision

### Day 1 Recap — Linux Fundamentals

```bash
# Navigation
pwd; ls -la; cd /var/www; cd ~; cd -

# File operations
cp source.txt dest.txt
mv old.txt new.txt
rm file.txt; rm -rf dir/
mkdir -p parent/child/grandchild

# File viewing
cat file.txt; less file.txt
head -20 file.txt; tail -f /var/log/syslog

# Search
grep -r "ServerName" /etc/apache2/
grep -n "error" /var/log/apache2/error.log
find /var/www -name "*.php" -mtime -1
find / -perm /4000 2>/dev/null    # Find SUID files

# Text processing
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head 10
sed -i 's/http:/https:/g' config.txt
cut -d: -f1 /etc/passwd | sort

# Pipes and redirection
ls -la | grep ".conf" | wc -l
command > out.txt 2>&1    # stdout + stderr to file
command >> out.txt         # append
command1 | command2        # pipe stdout to stdin
```

---

### Day 2 Recap — Apache Basics

```bash
# Install
sudo apt install apache2 -y

# Control
sudo systemctl start|stop|restart|reload|status apache2
sudo systemctl enable apache2    # Start on boot
sudo systemctl is-active apache2

# Config structure
/etc/apache2/apache2.conf        # Main config
/etc/apache2/ports.conf          # Port definitions
/etc/apache2/sites-available/    # Available VHost configs
/etc/apache2/sites-enabled/      # Active VHosts (symlinks)
/etc/apache2/mods-available/     # Available modules
/etc/apache2/mods-enabled/       # Enabled modules (symlinks)

# Site/module management
sudo a2ensite  mysite.conf      sudo a2dissite  mysite.conf
sudo a2enmod   rewrite          sudo a2dismod   autoindex

# ALWAYS check syntax before reloading!
sudo apache2ctl configtest

# Default web root
/var/www/html/

# Logs
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log
```

---

### Day 3 Recap — Virtual Hosts, Modules, Processes

```bash
# Virtual Host skeleton
# /etc/apache2/sites-available/mysite.conf:
# <VirtualHost *:80>
#     ServerName mysite.local
#     ServerAlias www.mysite.local
#     DocumentRoot /var/www/mysite/public_html
#     <Directory /var/www/mysite/public_html>
#         Options -Indexes +FollowSymLinks
#         AllowOverride All
#         Require all granted
#     </Directory>
#     ErrorLog  ${APACHE_LOG_DIR}/mysite-error.log
#     CustomLog ${APACHE_LOG_DIR}/mysite-access.log combined
# </VirtualHost>

# Process management
ps aux | grep apache2
kill -15 PID        # SIGTERM — graceful
kill -9  PID        # SIGKILL — force
pkill apache2
pgrep -la apache2   # Find PIDs

# mod_rewrite .htaccess
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Systemd
sudo systemctl status apache2
sudo journalctl -u apache2 -f

# UFW firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status verbose
```

---

### Day 4 Recap — SSL, Security, Shell Scripting, Performance

```bash
# Self-signed SSL certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/mysite/mysite.key \
    -out    /etc/ssl/mysite/mysite.crt \
    -subj "/C=IN/ST=Delhi/L=Delhi/O=AyushDev/CN=mysite.local"

# SSL VHost directives
# SSLEngine on
# SSLCertificateFile    /etc/ssl/mysite/mysite.crt
# SSLCertificateKeyFile /etc/ssl/mysite/mysite.key
# SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
# Header always set Strict-Transport-Security "max-age=31536000"

# Security hardening
# ServerTokens Prod     — hide Apache version
# ServerSignature Off   — hide signature
# TraceEnable Off       — disable TRACE method
# Header always set X-Frame-Options "SAMEORIGIN"
# Header always set X-Content-Type-Options "nosniff"

# Users & permissions
sudo useradd -m -s /bin/bash webdev
sudo usermod -aG www-data webdev
chmod 755 /var/www/mysite/      # Directories
chmod 644 /var/www/mysite/*.html # HTML files
chmod 600 /etc/ssl/mysite/*.key  # Private keys

# Cron
crontab -e
# 0 2 * * *  /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1

# MPM Event (best performance)
sudo a2dismod mpm_prefork
sudo a2enmod  mpm_event
sudo systemctl restart apache2
ab -n 1000 -c 50 http://localhost/
```

---

## 🏆 Section 7: Capstone Project

### "LinuxWeb Dashboard" — Full LAMP Application Setup

```bash
# ── Step 1: Install full LAMP stack ──────────────────────
sudo apt update
sudo apt install apache2 php libapache2-mod-php php-mysql \
    mariadb-server mariadb-client -y

# ── Step 2: Enable all needed modules ────────────────────
sudo a2enmod rewrite ssl headers expires deflate
sudo systemctl restart apache2

# ── Step 3: Secure MariaDB ────────────────────────────────
sudo mysql_secure_installation

# ── Step 4: Create capstone database and user ─────────────
sudo mysql << 'SQL'
CREATE DATABASE dashboard_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER 'dashuser'@'localhost' IDENTIFIED BY 'Dashboard@2026!';
GRANT ALL PRIVILEGES ON dashboard_db.* TO 'dashuser'@'localhost';
FLUSH PRIVILEGES;

USE dashboard_db;

CREATE TABLE activity_log (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    action     VARCHAR(200) NOT NULL,
    user_ip    VARCHAR(45),
    details    TEXT,
    logged_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_snapshots (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    cpu_load    DECIMAL(5,2),
    mem_used_mb INT,
    mem_total_mb INT,
    disk_used_pct TINYINT,
    apache_status TINYINT(1) DEFAULT 1,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "Database setup complete"

# ── Step 5: Create project directory structure ────────────
sudo mkdir -p /var/www/dashboard/{public_html,config,includes,assets/css}
sudo chown -R $USER:www-data /var/www/dashboard
sudo chmod -R 2755 /var/www/dashboard
sudo chmod 750 /var/www/dashboard/config

# ── Step 6: Create SSL certificate ───────────────────────
sudo mkdir -p /etc/ssl/dashboard
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/dashboard/dashboard.key \
    -out    /etc/ssl/dashboard/dashboard.crt \
    -subj "/C=IN/ST=Delhi/L=Delhi/O=AyushDev/CN=dashboard.local" \
    2>/dev/null
sudo chmod 600 /etc/ssl/dashboard/dashboard.key
echo "SSL certificate created"

# ── Step 7: Configure Apache VHost ───────────────────────
sudo tee /etc/apache2/sites-available/dashboard.conf << 'EOF'
<VirtualHost *:80>
    ServerName dashboard.local
    Redirect permanent / https://dashboard.local/
</VirtualHost>

<VirtualHost *:443>
    ServerName dashboard.local
    DocumentRoot /var/www/dashboard/public_html

    SSLEngine on
    SSLCertificateFile    /etc/ssl/dashboard/dashboard.crt
    SSLCertificateKeyFile /etc/ssl/dashboard/dashboard.key
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1

    <IfModule mod_headers.c>
        Header always set Strict-Transport-Security "max-age=31536000"
        Header always set X-Frame-Options "SAMEORIGIN"
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-XSS-Protection "1; mode=block"
    </IfModule>

    <Directory /var/www/dashboard/public_html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    <Directory /var/www/dashboard/config>
        Require all denied
    </Directory>
    <Directory /var/www/dashboard/includes>
        Require all denied
    </Directory>

    ErrorLog  ${APACHE_LOG_DIR}/dashboard-error.log
    CustomLog ${APACHE_LOG_DIR}/dashboard-access.log combined
</VirtualHost>
EOF

sudo a2enmod ssl
sudo a2ensite dashboard.conf
echo "127.0.0.1 dashboard.local" | sudo tee -a /etc/hosts
sudo apache2ctl configtest && sudo systemctl reload apache2

# ── Step 8: Full LAMP verification ───────────────────────
echo ""
echo "==============================="
echo " LAMP Stack Status Check"
echo "==============================="
systemctl is-active apache2 && echo "✅ Apache:  Running" || echo "❌ Apache:  Down"
systemctl is-active mariadb && echo "✅ MariaDB: Running" || echo "❌ MariaDB: Down"
php -r "echo '✅ PHP:     ' . PHP_VERSION . PHP_EOL;"
mysql -u dashuser -pDashboard@2026! dashboard_db \
    -e "SELECT '✅ DB Conn: OK' AS Status;" 2>/dev/null \
    || echo "❌ DB Conn: Failed"
curl -ks https://dashboard.local -o /dev/null -w "✅ HTTPS:   %{http_code}\n" \
    || echo "❌ HTTPS:   Not reachable"
echo "==============================="
```

---

## 📝 Practice Tasks

### Task 1 — LAMP Quick Test

```bash
# One-liner LAMP install and test
sudo apt install apache2 php libapache2-mod-php mariadb-server -y && \
echo "<?php phpinfo(); ?>" | sudo tee /var/www/html/test.php && \
curl -s http://localhost/test.php | grep -i "PHP Version" && \
sudo rm /var/www/html/test.php && echo "LAMP test passed!"
```

### Task 2 — MySQL Full Cycle

```bash
sudo mysql << 'SQL'
CREATE DATABASE practice_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'practice'@'localhost' IDENTIFIED BY 'Practice@123!';
GRANT ALL ON practice_db.* TO 'practice'@'localhost';
FLUSH PRIVILEGES;
USE practice_db;
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    published TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO posts (title, body, published) VALUES
    ('Day 1: Linux Basics', 'Learned ls, grep, find...', 1),
    ('Day 2: Apache Setup', 'Installed and configured Apache...', 1),
    ('Day 3: Virtual Hosts', 'Created multiple VHosts...', 1),
    ('Day 4: SSL and Security', 'Set up HTTPS with openssl...', 1),
    ('Day 5: LAMP Stack', 'Deployed full PHP+MySQL app!', 1);
SELECT id, title, published, created_at FROM posts ORDER BY id;
SELECT COUNT(*) AS total_posts FROM posts WHERE published=1;
SQL
echo "MySQL Task 2 complete"
```

### Task 3 — System Monitoring Snapshot

```bash
echo "===== System Monitoring Snapshot =====" && \
echo "[ Date    ] $(date)" && \
echo "[ Uptime  ] $(uptime -p)" && \
echo "[ Load    ] $(cat /proc/loadavg | cut -d' ' -f1-3)" && \
echo "[ CPU     ] $(nproc) cores — $(grep -c processor /proc/cpuinfo) logical" && \
echo "[ Memory  ] $(free -h | awk '/^Mem:/{print $3 " used / " $2}')" && \
echo "[ Disk /  ] $(df -h / | awk 'NR==2{print $3 " used / " $2 " (" $5 ")"}')" && \
echo "[ Apache  ] $(systemctl is-active apache2)" && \
echo "[ MariaDB ] $(systemctl is-active mariadb 2>/dev/null || echo 'not installed')" && \
echo "[ PHP     ] $(php -r 'echo PHP_VERSION;' 2>/dev/null || echo 'not installed')" && \
echo "[ Ports   ]" && sudo ss -tlnp | awk 'NR>1{print "  " $4}' | sort -u && \
echo "======================================="
```

### Task 4 — mysqldump Backup with Verification

```bash
# Create backup
mysqldump -u root -p practice_db | gzip > /tmp/practice_db_$(date +%Y%m%d).sql.gz

# Verify backup file
ls -lh /tmp/practice_db_*.sql.gz

# Verify contents (check table names inside)
zcat /tmp/practice_db_$(date +%Y%m%d).sql.gz | grep "^CREATE TABLE"

echo "Backup verified!"
```

---

## 💡 Key Takeaways — All 5 Days

| Day | Core Topic | The Most Important Thing |
|-----|-----------|--------------------------|
| **Day 1** | Linux Fundamentals | Pipes + `grep`/`awk`/`find` are your power tools |
| **Day 2** | Apache Basics | `a2ensite`, `configtest`, then reload — always |
| **Day 3** | VHosts + Modules | `ServerName` decides which VHost handles a request |
| **Day 4** | SSL + Security + Scripts | `set -euo pipefail` + `ServerTokens Prod` + prepared statements |
| **Day 5** | LAMP + Monitoring | Never raw SQL — always PDO; never `display_errors=On` in production |

### The Golden 10 Rules

```
1.  sudo apache2ctl configtest    — BEFORE every Apache reload
2.  ServerTokens Prod             — ALWAYS hide Apache version
3.  chmod 600 *.key               — Private keys are private
4.  bind-address = 127.0.0.1     — Never expose MySQL to the internet
5.  Never root for app DB user    — Create dedicated low-privilege users
6.  PDO prepared statements       — Never concatenate SQL strings
7.  display_errors = Off          — In every production php.ini
8.  mysqldump before DB changes   — Backup, then modify
9.  journalctl -u apache2 -f      — Know your logs
10. ufw allow 22,80,443/tcp       — Firewall on, SSH open
```

---

*🎉 5-Day Linux & Apache Training Complete!*
