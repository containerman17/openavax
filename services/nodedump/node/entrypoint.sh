#!/bin/bash

set -exuo pipefail

BASE_URL="https://pub-4acfad0eb35e44288b1582d441ca0e09.r2.dev/avalanche-snapshots"
DATA_DIR="/root/.avalanchego"

if [ ! -d "$DATA_DIR" ]; then
    echo "Data directory not found, downloading snapshot..."
    
    curl -s "$BASE_URL/manifest.json" -o manifest.json
    FILENAME=$(cat manifest.json | grep -o '"filename":"[^"]*"' | cut -d'"' -f4)
    
    echo "Downloading $FILENAME..."
    curl -L --progress-bar "$BASE_URL/$FILENAME" -o snapshot.tar.zst
    
    echo "Extracting snapshot..."
    zstd -d snapshot.tar.zst -o snapshot.tar
    tar -xf snapshot.tar
    mv data "$DATA_DIR"
    
    rm manifest.json snapshot.tar.zst snapshot.tar
    echo "Snapshot restored to $DATA_DIR"
fi

echo "Starting avalanchego..."
exec /build/avalanchego
