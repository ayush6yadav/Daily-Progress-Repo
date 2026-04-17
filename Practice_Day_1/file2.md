# Lab Report: Day 1 Verification

### Objective
To successfully install Apache on a Linux host and verify its accessibility via the local network.

### Steps Taken
1. Updated the Linux package repository to ensure security patches were current.
2. Installed the `apache2` package via the terminal.
3. Verified the process was assigned a **PID (Process ID)** by Linux using `ps aux | grep apache2`.

### Results
* **Localhost Test:** Successfully loaded the "Testing Day 1" page by visiting `http://127.0.0.1`.
* **Configuration Integrity:** Verified that `/etc/apache2/apache2.conf` exists and is readable by the root user.

### Issues Encountered
* *Issue:* Permission denied when trying to edit `index.html`.
* *Solution:* Used `sudo` (SuperUser Do) to override Linux filesystem restrictions, as `/var/www/html` is protected.