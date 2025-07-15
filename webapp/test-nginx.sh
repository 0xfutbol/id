#!/bin/bash

echo "Testing nginx configuration..."

# Test nginx configuration syntax
nginx -t -c /etc/nginx/nginx.conf

echo "Checking nginx directories and permissions..."
ls -la /var/log/nginx/
ls -la /var/run/nginx/
ls -la /etc/nginx/

echo "Testing if nginx can start manually..."
nginx -g 'daemon off;' &
NGINX_PID=$!
sleep 2
kill $NGINX_PID 2>/dev/null || true

echo "Done." 