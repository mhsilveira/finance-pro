#!/usr/bin/env python3
"""Test script for transaction editing fixes"""

import requests
import json
import sys

API_BASE = "http://localhost:3001/dev"
USER_ID = "blanchimaah"

def test_create_transaction():
    """Test 1: Create a transaction with all fields"""
    print("\n📝 Test 1: Creating test transaction...")

    response = requests.post(f"{API_BASE}/transactions", json={
        "userId": USER_ID,
        "description": "Test Transaction",
        "amount": 100.50,
        "type": "expense",
        "origin": "CASH",
        "category": "Alimentação",
        "date": "2025-12-16"
    })

    if response.status_code != 201:
        print(f"❌ Failed to create transaction: {response.status_code}")
        print(f"Response: {response.text}")
        return None

    data = response.json()
    transaction_id = data.get('id')
    print(f"✅ Created transaction: {transaction_id}")
    return transaction_id

def test_get_transaction(transaction_id):
    """Test 2: Get transaction and verify category"""
    print("\n📖 Test 2: Fetching transaction...")

    response = requests.get(f"{API_BASE}/transactions/{transaction_id}")
    if response.status_code != 200:
        print(f"❌ Failed to get transaction: {response.status_code}")
        return False

    data = response.json()
    category = data.get('category', 'MISSING')

    if category == "Alimentação":
        print(f"✅ Category correctly returned: {category}")
        return True
    else:
        print(f"❌ Category incorrect: {category}")
        return False

def test_update_transaction(transaction_id):
    """Test 3: Update transaction with different category"""
    print("\n🔄 Test 3: Updating transaction with different category...")

    response = requests.put(f"{API_BASE}/transactions/{transaction_id}", json={
        "category": "Transporte",
        "origin": "CREDIT_CARD",
        "card": "Nubank"
    })

    if response.status_code not in [200, 201]:
        print(f"❌ Update failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False

    data = response.json()
    if 'error' in data:
        print(f"❌ Update returned error: {data['error']}")
        return False

    print("✅ Update successful")
    return True

def test_verify_update(transaction_id):
    """Test 4: Verify the update"""
    print("\n✔️  Test 4: Verifying update...")

    response = requests.get(f"{API_BASE}/transactions/{transaction_id}")
    if response.status_code != 200:
        print(f"❌ Failed to verify: {response.status_code}")
        return False

    data = response.json()
    category = data.get('category', 'MISSING')
    card = data.get('card', 'MISSING')

    if category == "Transporte" and card == "Nubank":
        print(f"✅ Update verified: Category={category}, Card={card}")
        return True
    else:
        print(f"❌ Update verification failed: Category={category}, Card={card}")
        return False

def test_list_transactions():
    """Test 5: Check all transactions have categories"""
    print("\n🗄️  Test 5: Fetching all transactions to check categories...")

    response = requests.get(f"{API_BASE}/transactions?userId={USER_ID}&limit=5")
    if response.status_code != 200:
        print(f"❌ Failed to list transactions: {response.status_code}")
        return False

    data = response.json()
    transactions = data.get('data', [])

    missing_category = [t for t in transactions if 'category' not in t]

    if not missing_category:
        print(f"✅ All transactions have category field ({len(transactions)} checked)")
        return True
    else:
        print(f"❌ {len(missing_category)} transactions missing category field")
        return False

def cleanup_transaction(transaction_id):
    """Cleanup: Delete test transaction"""
    print("\n🧹 Cleaning up test transaction...")
    response = requests.delete(f"{API_BASE}/transactions/{transaction_id}")
    if response.status_code in [200, 204]:
        print("✅ Cleanup successful")
    else:
        print(f"⚠️  Cleanup warning: {response.status_code}")

def main():
    print("🧪 Testing Transaction Edit Functionality")
    print("=" * 50)

    try:
        # Run tests
        transaction_id = test_create_transaction()
        if not transaction_id:
            sys.exit(1)

        if not test_get_transaction(transaction_id):
            cleanup_transaction(transaction_id)
            sys.exit(1)

        if not test_update_transaction(transaction_id):
            cleanup_transaction(transaction_id)
            sys.exit(1)

        if not test_verify_update(transaction_id):
            cleanup_transaction(transaction_id)
            sys.exit(1)

        if not test_list_transactions():
            cleanup_transaction(transaction_id)
            sys.exit(1)

        # Cleanup
        cleanup_transaction(transaction_id)

        print("\n" + "=" * 50)
        print("✨ All tests passed successfully!")
        print("=" * 50)

    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to backend server")
        print(f"   Make sure the backend is running on {API_BASE}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
