function login_wait_logout {
    while true; do
        response=$(curl -s -X PUT $host/api/auth -d '{"email":"f@jwt.com", "password":"franchisee"}' -H 'Content-Type: application/json')
        token=$(echo $response | jq -r '.token')
        sleep 15
        curl -X DELETE $host/api/auth -H "Authorization: Bearer $token"
        sleep 5
    done
}

if [[ "$host" ]]; then
    login_wait_logout
else
    echo "\$host is not set. please set the environment variable for the host"
fi