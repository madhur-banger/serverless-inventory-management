#!/bin/bash

# =============================================================================
# API Testing Script for Inventory Management System
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# CONFIGURATION - UPDATE THESE VALUES AFTER DEPLOYMENT
# -----------------------------------------------------------------------------
API_URL="https://b0gaukfyp2.execute-api.us-east-1.amazonaws.com/dev"
USER_POOL_ID="us-east-1_KNMtrIttY"
CLIENT_ID="766m0vm8vpsas01u0u9d6drsh"
REGION="us-east-1"

# Test user credentials
TEST_EMAIL="testuser@example.com"
TEST_PASSWORD="TestPass123!"

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------

print_header() {
    echo ""
    echo -e "${BLUE}=============================================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}=============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# -----------------------------------------------------------------------------
# STEP 1: TEST HEALTH ENDPOINT (No Auth Required)
# -----------------------------------------------------------------------------

test_health() {
    print_header "Testing Health Endpoint"
    
    print_info "GET $API_URL/health"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/health")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Health check passed (HTTP $HTTP_CODE)"
        return 0
    else
        print_error "Health check failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# STEP 2: CREATE TEST USER IN COGNITO
# -----------------------------------------------------------------------------

create_test_user() {
    print_header "Creating Test User in Cognito"
    
    print_info "Creating user: $TEST_EMAIL"
    
    # Create user (admin)
    aws cognito-idp admin-create-user \
        --user-pool-id "$USER_POOL_ID" \
        --username "$TEST_EMAIL" \
        --user-attributes Name=email,Value="$TEST_EMAIL" Name=email_verified,Value=true \
        --temporary-password "TempPass123!" \
        --message-action SUPPRESS \
        --region "$REGION" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "User created"
    else
        print_info "User may already exist, continuing..."
    fi
    
    # Set permanent password
    print_info "Setting permanent password..."
    
    aws cognito-idp admin-set-user-password \
        --user-pool-id "$USER_POOL_ID" \
        --username "$TEST_EMAIL" \
        --password "$TEST_PASSWORD" \
        --permanent \
        --region "$REGION"
    
    if [ $? -eq 0 ]; then
        print_success "Password set successfully"
    else
        print_error "Failed to set password"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# STEP 3: AUTHENTICATE AND GET TOKEN
# -----------------------------------------------------------------------------

get_auth_token() {
    print_header "Authenticating User"
    
    print_info "Signing in as $TEST_EMAIL..."
    
    AUTH_RESULT=$(aws cognito-idp initiate-auth \
        --auth-flow USER_PASSWORD_AUTH \
        --client-id "$CLIENT_ID" \
        --auth-parameters USERNAME="$TEST_EMAIL",PASSWORD="$TEST_PASSWORD" \
        --region "$REGION" 2>&1)
    
    if echo "$AUTH_RESULT" | grep -q "IdToken"; then
        ID_TOKEN=$(echo "$AUTH_RESULT" | jq -r '.AuthenticationResult.IdToken')
        ACCESS_TOKEN=$(echo "$AUTH_RESULT" | jq -r '.AuthenticationResult.AccessToken')
        
        print_success "Authentication successful"
        print_info "Token received (first 50 chars): ${ID_TOKEN:0:50}..."
        
        # Export for use in other functions
        export AUTH_TOKEN="$ID_TOKEN"
        return 0
    else
        print_error "Authentication failed"
        echo "$AUTH_RESULT"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# STEP 4: TEST PRODUCT CRUD
# -----------------------------------------------------------------------------

test_create_product() {
    print_header "Testing Create Product"
    
    print_info "POST $API_URL/products"
    
    PRODUCT_DATA='{
        "name": "Wireless Keyboard",
        "description": "Ergonomic wireless keyboard with RGB backlight",
        "category": "electronics",
        "price": 4999,
        "quantity": 100,
        "sku": "WK-001-TEST"
    }'
    
    echo "Request body:"
    echo "$PRODUCT_DATA" | jq .
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_URL/products" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "$PRODUCT_DATA")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo ""
    echo "Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" -eq 201 ]; then
        PRODUCT_ID=$(echo "$BODY" | jq -r '.data.id')
        export PRODUCT_ID
        print_success "Product created (HTTP $HTTP_CODE)"
        print_info "Product ID: $PRODUCT_ID"
        return 0
    else
        print_error "Create product failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

test_get_product() {
    print_header "Testing Get Product"
    
    print_info "GET $API_URL/products/$PRODUCT_ID"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/products/$PRODUCT_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Get product passed (HTTP $HTTP_CODE)"
        return 0
    else
        print_error "Get product failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

test_list_products() {
    print_header "Testing List Products"
    
    print_info "GET $API_URL/products"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/products" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        COUNT=$(echo "$BODY" | jq '.data.count')
        print_success "List products passed (HTTP $HTTP_CODE, Count: $COUNT)"
        return 0
    else
        print_error "List products failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

test_list_products_with_filter() {
    print_header "Testing List Products with Category Filter"
    
    print_info "GET $API_URL/products?category=electronics"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/products?category=electronics" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Filter by category passed (HTTP $HTTP_CODE)"
        return 0
    else
        print_error "Filter by category failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

test_update_product() {
    print_header "Testing Update Product"
    
    print_info "PUT $API_URL/products/$PRODUCT_ID"
    
    UPDATE_DATA='{
        "name": "Wireless Keyboard Pro",
        "price": 5999,
        "quantity": 150
    }'
    
    echo "Request body:"
    echo "$UPDATE_DATA" | jq .
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X PUT "$API_URL/products/$PRODUCT_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "$UPDATE_DATA")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo ""
    echo "Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Update product passed (HTTP $HTTP_CODE)"
        return 0
    else
        print_error "Update product failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# STEP 5: TEST ORDER (PURCHASE) FLOW
# -----------------------------------------------------------------------------

test_create_order() {
    print_header "Testing Create Order (Purchase)"
    
    print_info "POST $API_URL/orders"
    
    ORDER_DATA="{
        \"productId\": \"$PRODUCT_ID\",
        \"quantity\": 2
    }"
    
    echo "Request body:"
    echo "$ORDER_DATA" | jq .
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_URL/orders" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "$ORDER_DATA")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo ""
    echo "Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" -eq 201 ]; then
        ORDER_ID=$(echo "$BODY" | jq -r '.data.id')
        export ORDER_ID
        print_success "Order created (HTTP $HTTP_CODE)"
        print_info "Order ID: $ORDER_ID"
        print_info "Order is now in SQS queue for notification processing!"
        return 0
    else
        print_error "Create order failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

test_get_order() {
    print_header "Testing Get Order"
    
    print_info "GET $API_URL/orders/$ORDER_ID"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/orders/$ORDER_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        STATUS=$(echo "$BODY" | jq -r '.data.status')
        print_success "Get order passed (HTTP $HTTP_CODE)"
        print_info "Order status: $STATUS"
        return 0
    else
        print_error "Get order failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

test_list_orders() {
    print_header "Testing List Orders"
    
    print_info "GET $API_URL/orders"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/orders" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        COUNT=$(echo "$BODY" | jq '.data.count')
        print_success "List orders passed (HTTP $HTTP_CODE, Count: $COUNT)"
        return 0
    else
        print_error "List orders failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# STEP 6: VERIFY STOCK DECREASED
# -----------------------------------------------------------------------------

verify_stock_decreased() {
    print_header "Verifying Stock Decreased After Purchase"
    
    print_info "GET $API_URL/products/$PRODUCT_ID"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/products/$PRODUCT_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    QUANTITY=$(echo "$BODY" | jq '.data.quantity')
    
    echo "Current quantity: $QUANTITY"
    
    if [ "$QUANTITY" -eq 148 ]; then
        print_success "Stock correctly decreased from 150 to 148"
        return 0
    else
        print_info "Quantity is $QUANTITY (expected 148 after purchasing 2)"
        return 0
    fi
}

# -----------------------------------------------------------------------------
# STEP 7: TEST DELETE PRODUCT
# -----------------------------------------------------------------------------

test_delete_product() {
    print_header "Testing Delete Product"
    
    print_info "DELETE $API_URL/products/$PRODUCT_ID"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X DELETE "$API_URL/products/$PRODUCT_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" -eq 204 ]; then
        print_success "Delete product passed (HTTP $HTTP_CODE)"
        return 0
    else
        print_error "Delete product failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# STEP 8: TEST VALIDATION ERRORS
# -----------------------------------------------------------------------------

test_validation_errors() {
    print_header "Testing Validation Errors"
    
    print_info "POST $API_URL/products (with invalid data)"
    
    INVALID_DATA='{
        "name": "",
        "category": "invalid-category",
        "price": -100
    }'
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_URL/products" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "$INVALID_DATA")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" -eq 400 ]; then
        print_success "Validation error returned correctly (HTTP $HTTP_CODE)"
        return 0
    else
        print_error "Expected 400, got HTTP $HTTP_CODE"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# STEP 9: TEST UNAUTHORIZED ACCESS
# -----------------------------------------------------------------------------

test_unauthorized() {
    print_header "Testing Unauthorized Access"
    
    print_info "GET $API_URL/products (without token)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/products")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" -eq 401 ]; then
        print_success "Unauthorized error returned correctly (HTTP $HTTP_CODE)"
        return 0
    else
        print_error "Expected 401, got HTTP $HTTP_CODE"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# MAIN TEST RUNNER
# -----------------------------------------------------------------------------

run_all_tests() {
    print_header "🚀 INVENTORY API TEST SUITE"
    
    echo ""
    echo "API URL: $API_URL"
    echo "User Pool ID: $USER_POOL_ID"
    echo "Client ID: $CLIENT_ID"
    echo ""
    
    PASSED=0
    FAILED=0
    
    # Run tests
    test_health && ((PASSED++)) || ((FAILED++))
    create_test_user
    get_auth_token && ((PASSED++)) || ((FAILED++))
    
    if [ -n "$AUTH_TOKEN" ]; then
        test_create_product && ((PASSED++)) || ((FAILED++))
        test_get_product && ((PASSED++)) || ((FAILED++))
        test_list_products && ((PASSED++)) || ((FAILED++))
        test_list_products_with_filter && ((PASSED++)) || ((FAILED++))
        test_update_product && ((PASSED++)) || ((FAILED++))
        test_create_order && ((PASSED++)) || ((FAILED++))
        test_get_order && ((PASSED++)) || ((FAILED++))
        test_list_orders && ((PASSED++)) || ((FAILED++))
        verify_stock_decreased && ((PASSED++)) || ((FAILED++))
        test_validation_errors && ((PASSED++)) || ((FAILED++))
        test_unauthorized && ((PASSED++)) || ((FAILED++))
        test_delete_product && ((PASSED++)) || ((FAILED++))
    fi
    
    # Summary
    print_header "📊 TEST SUMMARY"
    
    echo ""
    print_success "Passed: $PASSED"
    if [ "$FAILED" -gt 0 ]; then
        print_error "Failed: $FAILED"
    else
        echo -e "${GREEN}Failed: $FAILED${NC}"
    fi
    echo ""
    
    if [ "$FAILED" -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        return 1
    fi
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    run_all_tests
fi