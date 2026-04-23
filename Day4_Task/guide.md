# Deploying Two React Apps on One Apache Server

## Project Structure

```
.
├── app1/                    ← React App 1: WeatherVista (Weather Dashboard)
│   ├── public/index.html
│   ├── src/
│   │   ├── index.js
│   │   └── App.js
│   └── package.json         ← "homepage": "/first"
│
├── app2/                    ← React App 2: TaskFlow (Task Manager)
│   ├── public/index.html
│   ├── src/
│   │   ├── index.js
│   │   └── App.js
│   └── package.json         ← "homepage": "/second"
│
└── react-apps.conf          ← Apache VirtualHost config
```

## Target URLs

| URL                      | App        |
|--------------------------|------------|
| http://localhost:8081    | App 1      |
| http://localhost:8082    | App 2      |
| http://localhost/first   | App 1      |
| http://localhost/second  | App 2      |

---

## Step-by-Step Deployment

### STEP 1: Install Node.js (if not installed)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version   # should show v18.x or higher
```

### STEP 2: Build React App 1

```bash
cd app1
npm install
npm run build
# Creates: app1/build/
```

### STEP 3: Build React App 2

```bash
cd ../app2
npm install
npm run build
# Creates: app2/build/
```

### STEP 4: Install Apache (if not installed)

```bash
sudo apt-get update
sudo apt-get install -y apache2
sudo systemctl enable apache2
sudo systemctl start apache2
```

### STEP 5: Copy Build Files to Apache Web Root

```bash
# Create target directories
sudo mkdir -p /var/www/app1
sudo mkdir -p /var/www/app2

# Copy built React apps
sudo cp -r app1/build/* /var/www/app1/
sudo cp -r app2/build/* /var/www/app2/

# Set Apache ownership
sudo chown -R www-data:www-data /var/www/app1
sudo chown -R www-data:www-data /var/www/app2

# Verify files are in place
ls /var/www/app1
ls /var/www/app2
```

### STEP 6: Enable Required Apache Modules

```bash
sudo a2enmod rewrite     # URL rewriting (for SPA fallback)
sudo a2enmod alias       # Alias directive (for /first, /second paths)
sudo a2enmod headers     # Optional: for security headers
```

### STEP 7: Install Apache Config

```bash
# Copy the config file
sudo cp react-apps.conf /etc/apache2/sites-available/react-apps.conf

# Enable the site
sudo a2ensite react-apps.conf

# Disable default site (optional, prevents conflicts)
sudo a2dissite 000-default.conf

# Test Apache config for syntax errors
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

### STEP 8: Verify Apache is Listening on All Ports

```bash
sudo netstat -tlnp | grep apache
# You should see: 0.0.0.0:80, 0.0.0.0:8081, 0.0.0.0:8082
```

### STEP 9: Test All 4 URLs

```bash
curl -I http://localhost:8081
curl -I http://localhost:8082
curl -I http://localhost/first
curl -I http://localhost/second
# All should return: HTTP/1.1 200 OK
```

---

## Key Concepts Explained

### Why `"homepage"` in package.json matters

When React builds, it embeds absolute asset paths. Without `"homepage"`:
- App at `/first` tries to load: `/static/js/main.js` → 404
- With `"homepage": "/first"`: loads `/first/static/js/main.js` ✓

For port-based (8081/8082), use `"homepage": "."` or `"homepage": "/"`.

### The RewriteRule for SPAs

React apps are Single Page Applications. If a user refreshes at `/first/tasks`,
Apache looks for a file called `tasks` — it doesn't exist. The rewrite rule
redirects all missing files back to `index.html`, letting React Router handle it:

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [L]
```

### `Listen` directive for ports

Apache only listens on port 80 and 443 by default. To add ports:
```apache
Listen 8081
Listen 8082
```

This goes at the TOP of the config (or in `/etc/apache2/ports.conf`).

### `Alias` vs `DocumentRoot`

- `DocumentRoot /var/www/app1` → serves app1 as the ROOT of that VirtualHost
- `Alias /first /var/www/app1` → maps the URL `/first` to the filesystem path

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `403 Forbidden` | Check `Require all granted` in `<Directory>` block |
| Blank white page | Check `"homepage"` in package.json matches the URL path |
| 404 on page refresh | Ensure `RewriteEngine On` and `RewriteRule` are in config |
| Port 8081 not accessible | Ensure `Listen 8081` is in config and firewall allows it |
| CSS/JS not loading on /first | Rebuild app1 with `"homepage": "/first"` in package.json |
| `apache2ctl configtest` fails | Check config syntax; look at `/var/log/apache2/error.log` |
| Changes not visible | Run `sudo systemctl restart apache2` after every config change |

---

## Firewall (if applicable)

```bash
# Ubuntu UFW
sudo ufw allow 80
sudo ufw allow 8081
sudo ufw allow 8082

# Or using iptables
sudo iptables -I INPUT -p tcp --dport 8081 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 8082 -j ACCEPT
```

---

## Quick Redeploy Script

```bash
#!/bin/bash
# redeploy.sh — run after making code changes

echo "Building app1..."
cd app1 && npm run build && cd ..

echo "Building app2..."
cd app2 && npm run build && cd ..

echo "Copying to Apache..."
sudo cp -r app1/build/* /var/www/app1/
sudo cp -r app2/build/* /var/www/app2/

echo "Restarting Apache..."
sudo systemctl restart apache2

echo "Done! Test at:"
echo "  http://localhost:8081"
echo "  http://localhost:8082"
echo "  http://localhost/first"
echo "  http://localhost/second"
```

Make it executable: `chmod +x redeploy.sh`grep -n "rewrite" $BREW_PREFIX/etc/httpd/httpd.conf