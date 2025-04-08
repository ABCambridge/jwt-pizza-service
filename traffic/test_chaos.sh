function cause_chaos {
    response=$(curl -s -X PUT $host/api/auth -d '{"email":"a@jwt.com", "password":"admin"}' -H 'Content-Type: application/json')

    token=$(echo $response | jq -r '.token')

    curl -X PUT $host/api/order/chaos/true  -H "Authorization: Bearer $token"

    curl -s -X POST $host/api/order -H 'Content-Type: application/json' -d '{"franchiseId": 1, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}'  -H "Authorization: Bearer $token"
}

if [[ "$host" ]]; then
    cause_chaos
else
    echo "\$host is not set. please set the environment variable for the host"
fi