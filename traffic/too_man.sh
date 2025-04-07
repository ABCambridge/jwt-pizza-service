while true; do
  response=$(curl -s -X PUT $host/api/auth -d '{"email":"d@jwt.com", "password":"diner"}' -H 'Content-Type: application/json')
  token=$(echo $response | jq -r '.token')
  echo "Login hungry diner..."

  items='{ "menuId": 1, "description": "Veggie", "price": 0.05 }'
  for (( i=0; i < 21; i++ ))
  do items+=', { "menuId": 1, "description": "Veggie", "price": 0.05 }'
  done

  curl -s -X POST $host/api/order -H 'Content-Type: application/json' -d "{\"franchiseId\": 1, \"storeId\":1, \"items\":[$items]}"  -H "Authorization: Bearer $token"
  echo "Bought too many pizzas..."
  sleep 5
  curl -s -X DELETE $host/api/auth -H "Authorization: Bearer $token" > /dev/null
  echo "Logging out hungry diner..."
  sleep 10
done