#!/bin/bash

# Test script for transaction editing
set -e

API_BASE="http://localhost:3001/dev"
USER_ID="blanchimaah"

echo "🧪 Testing Transaction Edit Functionality"
echo "=========================================="

# Test 1: Create a transaction with all fields
echo ""
echo "📝 Test 1: Creating test transaction..."
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "description": "Test Transaction",
    "amount": 100.50,
    "type": "expense",
    "origin": "CASH",
    "category": "Alimentação",
    "date": "2025-12-16"
  }')

TRANSACTION_ID=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

if [ -z "$TRANSACTION_ID" ]; then
  echo "❌ Failed to create transaction"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

echo "✅ Created transaction: $TRANSACTION_ID"

# Test 2: Get the transaction and verify category
echo ""
echo "📖 Test 2: Fetching transaction..."
GET_RESPONSE=$(curl -s "${API_BASE}/transactions/${TRANSACTION_ID}")
CATEGORY=$(echo $GET_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('category', 'MISSING'))" 2>/dev/null)

if [ "$CATEGORY" = "Alimentação" ]; then
  echo "✅ Category correctly returned: $CATEGORY"
else
  echo "❌ Category incorrect: $CATEGORY"
  exit 1
fi

# Test 3: Update with null origin (old data scenario)
echo ""
echo "🔄 Test 3: Updating transaction with different category..."
UPDATE_RESPONSE=$(curl -s -X PUT "${API_BASE}/transactions/${TRANSACTION_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Transporte",
    "origin": "CREDIT_CARD",
    "card": "Nubank"
  }')

UPDATE_STATUS=$(echo $UPDATE_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print('error' if 'error' in data else 'success')" 2>/dev/null)

if [ "$UPDATE_STATUS" = "success" ]; then
  echo "✅ Update successful"
else
  echo "❌ Update failed"
  echo "Response: $UPDATE_RESPONSE"
  exit 1
fi

# Test 4: Verify the update
echo ""
echo "✔️  Test 4: Verifying update..."
VERIFY_RESPONSE=$(curl -s "${API_BASE}/transactions/${TRANSACTION_ID}")
NEW_CATEGORY=$(echo $VERIFY_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('category', 'MISSING'))" 2>/dev/null)
NEW_CARD=$(echo $VERIFY_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('card', 'MISSING'))" 2>/dev/null)

if [ "$NEW_CATEGORY" = "Transporte" ] && [ "$NEW_CARD" = "Nubank" ]; then
  echo "✅ Update verified: Category=$NEW_CATEGORY, Card=$NEW_CARD"
else
  echo "❌ Update verification failed: Category=$NEW_CATEGORY, Card=$NEW_CARD"
  exit 1
fi

# Test 5: Test with old transactions (null origin)
echo ""
echo "🗄️  Test 5: Fetching all transactions to check categories..."
LIST_RESPONSE=$(curl -s "${API_BASE}/transactions?userId=${USER_ID}&limit=5")
HAS_CATEGORIES=$(echo $LIST_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print('yes' if all('category' in t for t in data['data']) else 'no')" 2>/dev/null)

if [ "$HAS_CATEGORIES" = "yes" ]; then
  echo "✅ All transactions have category field"
else
  echo "❌ Some transactions missing category field"
  exit 1
fi

# Cleanup
echo ""
echo "🧹 Cleaning up test transaction..."
curl -s -X DELETE "${API_BASE}/transactions/${TRANSACTION_ID}" > /dev/null

echo ""
echo "=========================================="
echo "✨ All tests passed successfully!"
echo "=========================================="
