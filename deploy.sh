#!/bin/bash

# verify existence of important variables
if [[ -z "${PRODUCTION_API_KEY}" ||\
  -z "${STAGING_API_KEY}" ||\
  -z "${DEFAULT_LOGGING_URL}" ||\
  -z "${WEBSITE_LOGGING_URL}" ||\
  -z "${ZONE_ID}" ||\
  -z "${CLOUDFLARE_EMAIL}" ||\
  -z "${ACCOUNT_AUTH_KEY}" ]]
then
  echo "Missing one of the environment variables. Please make sure everything is set in the local environment."
  exit 0
fi

# Replace _VARIABLE_ with the environment variable
for e in $(env); do
  sed -i.bk 's/_'"${e%=*}"'_/'"${e#*=}"'/' main.js > /dev/null 2>&1;
done

# Deploy to Cloudflare
curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/script"\
-H "X-Auth-Email:$CLOUDFLARE_EMAIL"\
-H "X-Auth-Key:$ACCOUNT_AUTH_KEY"\
-H "Content-Type:application/javascript"\
--data-binary "@main.js"
