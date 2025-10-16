#!/bin/bash

echo "=== Build Verification ==="
echo "Current directory: $(pwd)"
echo ""

echo "Client directory contents:"
ls -la client/ 2>/dev/null || echo "ERROR: client/ not found"
echo ""

echo "Check: client/index.html"
test -f client/index.html && echo "✅ YES" || echo "❌ NO"
echo ""

echo "Running build..."
npm run build
echo ""

echo "Build complete. Dist contents:"
ls -la dist/ 2>/dev/null || echo "ERROR: dist/ not found"
