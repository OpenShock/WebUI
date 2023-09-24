#!/bin/sh

# Variables for startup script
SERVE_PATH=/usr/share/nginx/html
NAME=ShockLink

require() {
    if [ -z "$1" ]; then
        echo "Env var '$1' is required. Specify it and restart the container."
        exit 1
    fi
}

# Method that accepts one argument, the name of the environment variable to inject.
# Will substitute said variable as a literal string 
inject() {
    if [ -z "$1" ] && [ -z "$2" ]; then
        echo "[$NAME] Usage: inject <variable> <value>"
    fi

    # Ensure the environment variable has a value specified.
    require $1

    echo "[$NAME] Injecting variable: $1 = $2"
    sed -i 's/$1/${!var}/g' $SERVE_PATH/*.js
}

# Inject our variables.
inject SHOCKLINK_API_DOMAIN $SHOCKLINK_API_DOMAIN
inject SHOCKLINK_WEBUI_DOMAIN $SHOCKLINK_WEBUI_DOMAIN

# Start nginx as normal.
# If something breaks, see: https://github.com/nginxinc/docker-nginx/blob/master/mainline/debian/Dockerfile
echo "[$NAME] Starting nginx"
./docker-entrypoint.sh "$@"
