function login_buy_wait_logout_wait {
    while true; do
        response=$(curl -s -X PUT $host/api/auth -d '{"email":"d@jwt.com", "password":"diner"}' -H 'Content-Type: application/json')
        token=$(echo $response | jq -r '.token')
        curl -s -X POST $host/api/order -H 'Content-Type: application/json' -d '{"franchiseId": 1, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 },{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}'  -H "Authorization: Bearer $token"
        sleep 5
        curl -X DELETE $host/api/auth -H "Authorization: Bearer $token"
        sleep 10
    done
}

if [[ "$host" ]]; then
    login_buy_wait_logout_wait
else
    echo "\$host is not set. please set the environment variable for the host"
fi