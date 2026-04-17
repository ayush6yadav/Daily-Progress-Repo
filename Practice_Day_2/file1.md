# Theory: Linux Permissions and Apache Architecture

### 1. The "www-data" User
In Linux, for security reasons, we never run a web server as the 'root' user. If the server were hacked, the attacker would gain total control. Instead, Apache uses `www-data`. 
* **The Rule:** Apache must have 'Read' access to files and 'Execute' access to directories to serve content.

### 2. Understanding Permissions (The Numeric Way)
Linux permissions are calculated as:
* **Read (4)**, **Write (2)**, **Execute (1)**.
* **755 (rwxr-xr-x):** The Owner has 7 (4+2+1), Group has 5 (4+1), and Others have 5 (4+1).
* **644 (rw-r--r--):** Standard for web files where no execution is needed.



### 3. Apache Configuration Hierarchy
Apache on Linux uses a modular approach:
* **/etc/apache2/apache2.conf**: The main global configuration.
* **/etc/apache2/ports.conf**: Defines which IP addresses and ports Apache listens on.
* **/etc/apache2/mods-enabled/**: Contains symbolic links to scripts that add functionality (like SSL or PHP support).

### 4. Restart vs. Reload
* **Restart:** Kills all Apache processes and starts new ones. This causes a brief "downtime."
* **Reload:** Tells the existing processes to read the new configuration files. This is the **Professional Standard** as it doesn't disconnect current visitors.