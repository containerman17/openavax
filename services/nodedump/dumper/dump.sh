#!/bin/bash

set -e

[ -z "$R2_BUCKET" ] && { echo "R2_BUCKET required"; exit 1; }
[ -z "$R2_ACCESS_KEY_ID" ] && { echo "R2_ACCESS_KEY_ID required"; exit 1; }
[ -z "$R2_SECRET_ACCESS_KEY" ] && { echo "R2_SECRET_ACCESS_KEY required"; exit 1; }
[ -z "$R2_ENDPOINT" ] && { echo "R2_ENDPOINT required"; exit 1; }

DUMP_FILE="dump-$(date +%Y%m%d-%H%M%S).tar.zst"

docker compose stop 
tar -cf - --exclude=data/staking data | zstd > "$DUMP_FILE"
rclone copy "$DUMP_FILE" ":s3:/$R2_BUCKET/" --s3-provider=Cloudflare --s3-access-key-id="$R2_ACCESS_KEY_ID" --s3-secret-access-key="$R2_SECRET_ACCESS_KEY" --s3-endpoint="$R2_ENDPOINT"
echo "{\"filename\":\"$DUMP_FILE\"}" > manifest.json
rclone copy "manifest.json" ":s3:/$R2_BUCKET/" --s3-provider=Cloudflare --s3-access-key-id="$R2_ACCESS_KEY_ID" --s3-secret-access-key="$R2_SECRET_ACCESS_KEY" --s3-endpoint="$R2_ENDPOINT"
rm "$DUMP_FILE"
rm "manifest.json"
docker compose up -d
