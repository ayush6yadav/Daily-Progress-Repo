
##  Practice Tasks

### Task 1 — Process Management
```bash
# 1. Run a sleep process in background
sleep 500 &

# 2. Find its PID
pgrep sleep

# 3. Check its nice value
ps -o pid,ni,comm -p $(pgrep sleep)

# 4. Change its nice value to 10
sudo renice -n 10 -p $(pgrep sleep)

# 5. Kill it gracefully
pkill sleep
```

### Task 2 — Create a Virtual Host
```bash
# Create a local test site called "ayush.dev"
sudo mkdir -p /var/www/ayush.dev/public_html
sudo chown -R $USER:$USER /var/www/ayush.dev

cat > /var/www/ayush.dev/public_html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Ayush Dev - Day 3</title></head>
<body>
  <h1>🚀 Apache Virtual Host Working!</h1>
  <p>Day 3 of Linux + Apache training</p>
</body>
</html>
EOF

# Create VHost config
sudo tee /etc/apache2/sites-available/ayush.dev.conf << 'EOF'
<VirtualHost *:80>
    ServerName ayush.dev
    DocumentRoot /var/www/ayush.dev/public_html
    <Directory /var/www/ayush.dev/public_html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    ErrorLog ${APACHE_LOG_DIR}/ayush.dev-error.log
    CustomLog ${APACHE_LOG_DIR}/ayush.dev-access.log combined
</VirtualHost>
EOF

# Enable and test
sudo a2ensite ayush.dev.conf
sudo apache2ctl configtest
sudo systemctl reload apache2

# Add to /etc/hosts
echo "127.0.0.1 ayush.dev" | sudo tee -a /etc/hosts

# Test it
curl http://ayush.dev
```

### Task 3 — Log Analysis
```bash
# Generate some traffic
for i in {1..20}; do curl -s http://localhost > /dev/null; done

# Analyze the log
awk '{print $9}' /var/log/apache2/access.log | sort | uniq -c | sort -rn
# HTTP status code distribution

awk '{print $7}' /var/log/apache2/access.log | sort | uniq -c | sort -rn | head 10
# Top requested URLs
```
