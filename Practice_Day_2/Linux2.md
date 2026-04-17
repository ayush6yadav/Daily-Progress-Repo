##  Linux Permissions
* `ls -ld /var/www/html`: Check who owns the web folder.
* `sudo chown -R $USER:$USER /var/www/html`: Change ownership to the current user for easy editing.
* `chmod 644 index.html`: Set read/write permissions for the owner and read-only for others.