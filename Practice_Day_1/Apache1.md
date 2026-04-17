# Apache 
### It is a web server—the software that delivers web pages to your browser.

### Features of Apache
1. Free and Open Source: You don't pay a peny to use it, and anyone can see the code.
2. Cross-Platform: It runs on Linux, Windows, and macOS.
3. Reliable: It has been around since 1995 and powers about 30% of the internet.

# Day 1 : Apache Installation and basic Setup

### 1. Installation 
`$ sudo apt update` 
`$ sudo apt install apache2`

### 2. Service Management
`$ sudo systemctl start apache2`  : Starts the server.
`$ sudo systemctl enable apache2`  : Turns the server on.
`$ sudo systemctl status apache2`  : Checks the status.
`$ sudo systemctl stop apache2`  : Turns the server off.

### 3. Verification
$ curl -I http://localhost

