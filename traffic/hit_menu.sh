function hit_menu {
    while true; do
        curl -s $host/api/order/menu
        sleep 3
    done
}

if [[ "$host" ]]; then
    hit_menu 
else
    echo "\$host is not set. please set the environment variable for the host"
fi