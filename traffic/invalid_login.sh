function invalid_login {
    while true; do
        curl -s -X PUT $host/api/auth -d '{"email":"unknown@jwt.com", "password":"bad"}' -H 'Content-Type: application/json'
        sleep 8
    done
}

if [[ "$host" ]]; then
    invalid_login 
else
    echo "\$host is not set. please set the environment variable for the host"
fi