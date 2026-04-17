# Theory: The Linux-Apache Ecosystem

### 1. The Role of the Web Server
Apache acts as a bridge. It stays in a 'listening' state on the Linux network stack (Port 80). When a request arrives, the Linux Kernel hands that traffic to the Apache process, which then fetches the requested file from the disk.

### 2. Linux Package Management (APT)
In Linux, we use `apt` (Advanced Package Tool). Unlike Windows where you download an .exe, Linux uses "Repositories." 
* **The Benefit:** Linux handles all dependencies (extra libraries Apache needs) automatically during installation.

### 3. Systemd and Daemons
Apache runs as a **Daemon** (a background process). In modern Linux, these are managed by `systemd`. 
* **Unit Files:** Every service has a unit file located at `/lib/systemd/system/apache2.service`. This file tells Linux how to start, stop, and restart the server.



### 4. Default File Paths
* **Config:** `/etc/apache2/` (Crucial for settings)
* **Logs:** `/var/log/apache2/` (Crucial for debugging)
* **Web Root:** `/var/www/html/` (Where the public files live)