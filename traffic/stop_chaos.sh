function cause_chaos {
    response=$(curl -s -X PUT $host/api/auth -d '{"email":"a@jwt.com", "password":"admin"}' -H 'Content-Type: application/json')

    token=$(echo $response | jq -r '.token')

    curl -X PUT $host/api/order/chaos/false  -H "Authorization: Bearer $token"

}

if [[ "$host" ]]; then
    cause_chaos
else
    echo "\$host is not set. please set the environment variable for the host"
fi