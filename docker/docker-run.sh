#!/usr/bin/env bash

docker run \
    --name exp1 \
    -p 3001:3000 \
    -e RAILS_ENV=development \
    -e API_URL=http://alpha.openphacts.org:3002/ \
    -it \
    explorer3

#    --link ops-api:api \
#    -e API_URL=http://api:3002 \
