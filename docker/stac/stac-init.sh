#!/bin/bash
# STAC API Setup Script
# Creates collections and configures the STAC catalog

STAC_URL="http://stac-api:8082"
STAC_API_KEY="${STAC_API_KEY:-stac-api-key}"

echo "Waiting for STAC API to be ready..."
until curl -s "$STAC_URL/" > /dev/null; do
    echo "Waiting..."
    sleep 5
done
echo "STAC API is ready!"

# Create collections
echo "Creating STAC collections..."
curl -X POST \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d @stac-collections.json \
    "$STAC_URL/collections"

echo "STAC API setup complete!"
echo "Access STAC API at: $STAC_URL"
echo "STAC API docs: $STAC_URL/docs"