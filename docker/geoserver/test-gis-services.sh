#!/bin/bash
# Test GIS Services (WMS, WFS, STAC)
# Verifies that the services are working correctly

GEOSERVER_URL="http://localhost:8080/geoserver"
STAC_URL="http://localhost:8082"
TILE_URL="http://localhost:8083"

echo "=== Testing GIS Services ==="

# Test 1: WMS GetCapabilities
echo ""
echo "1. Testing WMS GetCapabilities..."
WMS_CAP=$(curl -s "$GEOSERVER_URL/wms?service=WMS&version=1.3.0&request=GetCapabilities")
if echo "$WMS_CAP" | grep -q "<WMS_Capabilities"; then
    echo "✓ WMS GetCapabilities: OK"
else
    echo "✗ WMS GetCapabilities: FAILED"
fi

# Test 2: WMS GetMap
echo ""
echo "2. Testing WMS GetMap..."
WMS_MAP=$(curl -s -o /dev/null -w "%{http_code}" \
    "$GEOSERVER_URL/nurisk/wms?service=WMS&version=1.3.0&request=GetMap&layers=nurisk:disaster_zones&bbox=105,-8,115,-5&width=800&height=600&crs=EPSG:4326&format=image/png")
if [ "$WMS_MAP" = "200" ]; then
    echo "✓ WMS GetMap: OK"
else
    echo "✗ WMS GetMap: FAILED (HTTP $WMS_MAP)"
fi

# Test 3: WFS GetCapabilities
echo ""
echo "3. Testing WFS GetCapabilities..."
WFS_CAP=$(curl -s "$GEOSERVER_URL/wfs?service=WFS&version=2.0.0&request=GetCapabilities")
if echo "$WFS_CAP" | grep -q "<WFS_Capabilities"; then
    echo "✓ WFS GetCapabilities: OK"
else
    echo "✗ WFS GetCapabilities: FAILED"
fi

# Test 4: WFS GetFeature (GeoJSON)
echo ""
echo "4. Testing WFS GetFeature (GeoJSON)..."
WFS_GEOJSON=$(curl -s -o /dev/null -w "%{http_code}" \
    "$GEOSERVER_URL/nurisk/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=nurisk:disaster_zones&outputFormat=application%2Fjson")
if [ "$WFS_GEOJSON" = "200" ]; then
    echo "✓ WFS GetFeature (GeoJSON): OK"
else
    echo "✗ WFS GetFeature (GeoJSON): FAILED (HTTP $WFS_GEOJSON)"
fi

# Test 5: WFS GetFeature (GML3)
echo ""
echo "5. Testing WFS GetFeature (GML3)..."
WFS_GML=$(curl -s -o /dev/null -w "%{http_code}" \
    "$GEOSERVER_URL/nurisk/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=nurisk:disaster_zones&outputFormat=text%2Fxml%3B%20subtype%3Dgml%2F3.1.1")
if [ "$WFS_GML" = "200" ]; then
    echo "✓ WFS GetFeature (GML3): OK"
else
    echo "✗ WFS GetFeature (GML3): FAILED (HTTP $WFS_GML)"
fi

# Test 6: WFS CQL Filter
echo ""
echo "6. Testing WFS CQL Filter..."
WFS_CQL=$(curl -s -o /dev/null -w "%{http_code}" \
    "$GEOSERVER_URL/nurisk/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=nurisk:disaster_zones&cql_filter=zone_type='flood'&outputFormat=application%2Fjson")
if [ "$WFS_CQL" = "200" ]; then
    echo "✓ WFS CQL Filter: OK"
else
    echo "✗ WFS CQL Filter: FAILED (HTTP $WFS_CQL)"
fi

# Test 7: STAC API root
echo ""
echo "7. Testing STAC API root..."
STAC_ROOT=$(curl -s "$STAC_URL/")
if echo "$STAC_ROOT" | grep -q "stac_version"; then
    echo "✓ STAC API root: OK"
else
    echo "✗ STAC API root: FAILED"
fi

# Test 8: STAC Collections
echo ""
echo "8. Testing STAC Collections..."
STAC_COLL=$(curl -s -o /dev/null -w "%{http_code}" "$STAC_URL/collections")
if [ "$STAC_COLL" = "200" ]; then
    echo "✓ STAC Collections: OK"
else
    echo "✗ STAC Collections: FAILED (HTTP $STAC_COLL)"
fi

# Test 9: STAC Search
echo ""
echo "9. Testing STAC Search..."
STAC_SEARCH=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$STAC_URL/search" \
    -H "Content-Type: application/json" \
    -d '{"bbox":[105,-8,115,-5],"datetime":"2024-01-01/2024-12-31"}')
if [ "$STAC_SEARCH" = "200" ]; then
    echo "✓ STAC Search: OK"
else
    echo "✗ STAC Search: FAILED (HTTP $STAC_SEARCH)"
fi

# Test 10: TiTiler tile endpoint
echo ""
echo "10. Testing TiTiler tile endpoint..."
TILE_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
    "$TILE_URL/tile/table/disaster_zones/5/31/32")
if [ "$TILE_TEST" = "200" ] || [ "$TILE_TEST" = "404" ]; then
    # 404 is OK if table doesn't exist yet
    echo "✓ TiTiler tile endpoint: OK (HTTP $TILE_TEST)"
else
    echo "✗ TiTiler tile endpoint: FAILED (HTTP $TILE_TEST)"
fi

echo ""
echo "=== GIS Services Test Complete ==="