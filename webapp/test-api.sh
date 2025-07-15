#!/bin/bash

echo "Testing API connectivity..."

# Test if we can reach the external API server
echo "1. Testing external API server connectivity..."
wget -q --timeout=10 -O - http://msid-server-oqxnsp-546de8-148-113-140-109.traefik.me:80/health || echo "Failed to connect to external API server"

# Test if we can reach the external API server with /api path
echo "2. Testing external API server /api path..."
wget -q --timeout=10 -O - http://msid-server-oqxnsp-546de8-148-113-140-109.traefik.me:80/api/ || echo "Failed to connect to external API server /api path"

# Test DNS resolution
echo "3. Testing DNS resolution..."
nslookup msid-server-oqxnsp-546de8-148-113-140-109.traefik.me || echo "DNS resolution failed"

# Test local nginx configuration
echo "4. Testing nginx configuration..."
nginx -t || echo "Nginx configuration test failed"

# Test if nginx can reach the upstream
echo "5. Testing upstream connectivity from nginx..."
curl -s --connect-timeout 5 http://msid-server-oqxnsp-546de8-148-113-140-109.traefik.me:80/ || echo "Upstream connection failed"

# Check nginx logs
echo "6. Checking nginx error logs..."
tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No error log found"

# Check API access logs
echo "7. Checking API access logs..."
tail -20 /var/log/nginx/api_access.log 2>/dev/null || echo "No API access log found"

echo "API connectivity test completed." 