#!/bin/bash

#sed -i "s,url *:.*,url: $API_URL," /explorer2/config/app_settings.yml
#sed -i "s,app_id *:.*,app_id: $API_APP_ID," /explorer2/config/app_settings.yml
#sed -i "s,app_key *:.*,app_key : $API_APP_KEY," /explorer2/config/app_settings.yml
#sed -i "s,maintenance *:.*,maintenance : $EXPLORER_MAINTENANCE," /explorer2/config/app_settings.yml
#cat /explorer2/config/app_settings.yml

/explorer2/script/delayed_job start

exec "$@"


