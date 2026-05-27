#!/bin/bash
echo -e "\n1. verify-email"
curl -s -X POST http://localhost:4000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "806535"}'

echo -e "\n\n2. login"
LOGIN_RES=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}')
echo "$LOGIN_RES"

REFRESH_TOKEN=$(echo "$LOGIN_RES" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

echo -e "\n\n3. refresh token"
curl -s -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"

echo -e "\n\n4. forgot-password"
curl -s -X POST http://localhost:4000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

echo -e "\n\n5. resend-otp"
curl -s -X POST http://localhost:4000/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

echo -e "\n\n6. logout"
curl -s -X POST http://localhost:4000/auth/logout \
  -H "Content-Type: application/json"

echo ""
