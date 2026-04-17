# Lab Report: Day 2 - Configuration & Hardening

### Objective
To modify the default network behavior of Apache and secure the filesystem using Linux permission logic.

### Steps Taken
1.  **Permission Hardening:** Verified that the `/var/www/html` directory is not world-writable to prevent unauthorized file uploads.
2.  **Port Reconfiguration:** Successfully moved the server from the default Port 80 to Port 8080. 
3.  **Validation:** Ran `apache2ctl configtest` which confirmed "Syntax OK."

### Results
* **Access Control:** Attempted to delete a file without `sudo` and confirmed that Linux successfully blocked the action, proving the permission structure is working.
* **Port Check:** Confirmed the server is reachable at `http://localhost:8080`.

### Key Discovery
I learned that the `apache2ctl` utility is a wrapper script for the Apache binary. It is safer to use than calling the binary directly because it interfaces correctly with the Linux environment variables.