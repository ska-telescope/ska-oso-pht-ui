#!/bin/env bash

if [ ! -f /.env ]; then
    echo "No Setup Required, mising /.env"
    exit
fi

{
    echo 'window.env = {'
    count=0
    while read -r line; do
        var="$(echo "$line" | cut -d '=' -f1)"
        default="$(echo "$line" | cut -d '=' -f2)"
        type="$(echo "$line" | cut -d '=' -f2  | cut -c1)"
        if [[ "$type" == "'" ]]; then
            default="$(echo "$default" | cut -d"'" -f 2)"
        fi
        val="${!var:-$default}"
        if [[ count -gt 0 ]]; then
            echo ','
        fi
        if [[ "$type" == "'" ]]; then
            echo -n "  $var: '$val'"
        else
            echo -n "  $var: $val"
        fi
        count=$((count+1))
    done < /.env
    echo -e "\n}"
} > /usr/share/nginx/html/env.js