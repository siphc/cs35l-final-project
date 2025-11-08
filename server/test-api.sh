#!/bin/sh

echo "======================================"
echo "🧪 Testing Backend API"
echo "======================================"
echo ""

API_URL="http://localhost:5002"

PASSED=0
FAILED=0

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:5002/api/auth/health)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] && echo "$BODY" | grep -q "success.*true"; then
  echo "✅ PASS - Health check returned 200"
  ((PASSED++))
else
  echo "❌ FAIL - Expected 200, got $HTTP_CODE"
  ((FAILED++))
fi
echo "$BODY"
echo ""

# Test 2: Valid Registration
echo "2️⃣ Testing Valid Registration..."
EMAIL="test$(date +%s)@example.com"  # Unique email
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"password123\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ] && echo "$BODY" | grep -q "success.*true"; then
  echo "✅ PASS - User registered successfully"
  ((PASSED++))
else
  echo "❌ FAIL - Expected 201, got $HTTP_CODE"
  ((FAILED++))
fi
echo "$BODY"
echo ""

# Test 3: Missing Email
echo "3️⃣ Testing Missing Email (Should fail with 400)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"password":"password123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ] && echo "$BODY" | grep -q "Email and password are required"; then
  echo "✅ PASS - Correctly rejected missing email"
  ((PASSED++))
else
  echo "❌ FAIL - Expected 400, got $HTTP_CODE"
  ((FAILED++))
fi
echo "$BODY"
echo ""

# Test 4: Missing Password
echo "4️⃣ Testing Missing Password (Should fail with 400)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test3@example.com"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ] && echo "$BODY" | grep -q "Email and password are required"; then
  echo "✅ PASS - Correctly rejected missing password"
  ((PASSED++))
else
  echo "❌ FAIL - Expected 400, got $HTTP_CODE"
  ((FAILED++))
fi
echo "$BODY"
echo ""

# Test 5: Short Password
echo "5️⃣ Testing Short Password (Should fail with 400)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ] && echo "$BODY" | grep -q "at least 6 characters"; then
  echo "✅ PASS - Correctly rejected short password"
  ((PASSED++))
else
  echo "❌ FAIL - Expected 400, got $HTTP_CODE"
  ((FAILED++))
fi
echo "$BODY"
echo ""

# Test 6: Invalid Email
echo "6️⃣ Testing Invalid Email (Should fail with 400)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"password123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ] && echo "$BODY" | grep -q "valid email"; then
  echo "✅ PASS - Correctly rejected invalid email"
  ((PASSED++))
else
  echo "❌ FAIL - Expected 400, got $HTTP_CODE"
  ((FAILED++))
fi
echo "$BODY"
echo ""

# Test 7: Duplicate User
echo "7️⃣ Testing Duplicate User (Should fail with 409)..."
# First, create a user
DUPLICATE_EMAIL="duplicate$(date +%s)@example.com"
curl -s -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DUPLICATE_EMAIL\",\"password\":\"password123\"}" > /dev/null

# Then try to create again
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DUPLICATE_EMAIL\",\"password\":\"different456\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 409 ] && echo "$BODY" | grep -q "already exists"; then
  echo "✅ PASS - Correctly rejected duplicate user"
  ((PASSED++))
else
  echo "❌ FAIL - Expected 409, got $HTTP_CODE"
  ((FAILED++))
fi
echo "$BODY"
echo ""

# Summary
echo "======================================"
echo "📊 Test Results"
echo "======================================"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "⚠️  Some tests failed"
  exit 1
fi