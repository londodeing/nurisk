#!/bin/bash
# GeoServer Setup Script
# Configures workspaces, PostGIS store, and publishes disaster layers

GEOSERVER_URL="http://geoserver:8080/geoserver"
GEOSERVER_USER="admin"
GEOSERVER_PASSWORD="${GEOSERVER_PASSWORD:-geoserver}"

echo "Waiting for GeoServer to be ready..."
until curl -s -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" "$GEOSERVER_URL/rest/" > /dev/null; do
    echo "Waiting..."
    sleep 5
done
echo "GeoServer is ready!"

# Create workspace
echo "Creating workspace 'nurisk'..."
curl -X POST \
    -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" \
    -H "Content-Type: application/xml" \
    -d '<workspace><name>nurisk</name></workspace>' \
    "$GEOSERVER_URL/rest/workspaces"

# Create PostGIS data store
echo "Creating PostGIS data store..."
curl -X POST \
    -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" \
    -H "Content-Type: application/xml" \
    -d '<dataStore>
        <name>postgis</name>
        <connectionParameters>
            <entry key="host">postgres</entry>
            <entry key="port">5432</entry>
            <entry key="database">nurisk</entry>
            <entry key="user">nurisk</entry>
            <entry key="passwd">nurisk</entry>
            <entry key="dbtype">postgis</entry>
            <entry key="schema">public</entry>
            <entry key="validateconnections">true</entry>
            <entry key="max connections">10</entry>
            <entry key="min connections">1</entry>
            <entry key="fetch size">1000</entry>
            <entry key="datastore">true</entry>
        </connectionParameters>
    </dataStore>' \
    "$GEOSERVER_URL/rest/workspaces/nurisk/datastores"

# Publish disaster_zones layer
echo "Publishing disaster_zones layer..."
curl -X POST \
    -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" \
    -H "Content-Type: application/xml" \
    -d '<featureType>
        <name>disaster_zones</name>
        <title>Disaster Zones</title>
        <abstract>Disaster risk zones including flood, earthquake, landslide, and volcano areas</abstract>
        <srs>EPSG:4326</srs>
        <latLonBoundingBox>
            <minx>105.0</minx>
            <maxx>115.0</maxx>
            <miny>-8.0</miny>
            <maxy>-5.0</maxy>
        </latLonBoundingBox>
    </featureType>' \
    "$GEOSERVER_URL/rest/workspaces/nurisk/datastores/postgis/featuretypes"

# Publish shelters layer
echo "Publishing shelters layer..."
curl -X POST \
    -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" \
    -H "Content-Type: application/xml" \
    -d '<featureType>
        <name>shelters</name>
        <title>Evacuation Shelters</title>
        <abstract>Emergency evacuation shelters and capacity information</abstract>
        <srs>EPSG:4326</srs>
    </featureType>' \
    "$GEOSERVER_URL/rest/workspaces/nurisk/datastores/postgis/featuretypes"

# Publish evacuation_routes layer
echo "Publishing evacuation_routes layer..."
curl -X POST \
    -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" \
    -H "Content-Type: application/xml" \
    -d '<featureType>
        <name>evacuation_routes</name>
        <title>Evacuation Routes</title>
        <abstract>Evacuation routes with capacity and status</abstract>
        <srs>EPSG:4326</srs>
    </featureType>' \
    "$GEOSERVER_URL/rest/workspaces/nurisk/datastores/postgis/featuretypes"

# Publish critical_infrastructure layer
echo "Publishing critical_infrastructure layer..."
curl -X POST \
    -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" \
    -H "Content-Type: application/xml" \
    -d '<featureType>
        <name>critical_infrastructure</name>
        <title>Critical Infrastructure</title>
        <abstract>Hospitals, schools, government buildings</abstract>
        <srs>EPSG:4326</srs>
    </featureType>' \
    "$GEOSERVER_URL/rest/workspaces/nurisk/datastores/postgis/featuretypes"

# Publish regional_boundaries layer
echo "Publishing regional_boundaries layer..."
curl -X POST \
    -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" \
    -H "Content-Type: application/xml" \
    -d '<featureType>
        <name>regional_boundaries</name>
        <title>Regional Boundaries</title>
        <abstract>Kabupaten/Kota boundaries in Central Java</abstract>
        <srs>EPSG:4326</srs>
    </featureType>' \
    "$GEOSERVER_URL/rest/workspaces/nurisk/datastores/postgis/featuretypes"

# Configure WMS settings
echo "Configuring WMS service..."
curl -X PUT \
    -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" \
    -H "Content-Type: application/xml" \
    -d '<wms>
        <id>wms</id>
        <enabled>true</enabled>
        <name>WMS</name>
        <title>Web Map Service</title>
        <maintainer>GeoServer</maintainer>
        <abstrct>Disaster Response WMS</abstrct>
        <accessConstraints>None</accessConstraints>
        <fees>None</fees>
        <version>1.3.0</version>
        <citeCompliant>false</citeCompliant>
        <onlineResource>http://geoserver.org</onlineResource>
        <schemaBaseURL>http://schemas.opengis.net</schemaBaseURL>
        <verbose>false</verbose>
        <metadata>
            <entry key="kmlReflectorMode">superoverlay</entry>
            <entry key="kmlSuperoverlayMode">auto</entry>
        </metadata>
        <srs>
            <string>EPSG:4326</string>
            <string>EPSG:3857</string>
        </srs>
        <bboxForEachCRS>false</bboxForEachCRS>
    </wms>' \
    "$GEOSERVER_URL/rest/services/wms"

# Configure WFS settings
echo "Configuring WFS service..."
curl -X PUT \
    -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" \
    -H "Content-Type: application/xml" \
    -d '<wfs>
        <id>wfs</id>
        <enabled>true</enabled>
        <name>WFS</name>
        <title>Web Feature Service</title>
        <maintainer>GeoServer</maintainer>
        <abstrct>Disaster Response WFS</abstrct>
        <accessConstraints>None</accessConstraints>
        <fees>None</fees>
        <version>2.0.0</version>
        <gmlPrefixing>false</gmlPrefixing>
        <latLon>true</latLon>
        <maxFeatures>1000000</maxFeatures>
        <featureChildren>false</featureChildren>
        <encodeDefaultSMIL>false</encodeDefaultSMIL>
        <encodeSchemaLocation>true</encodeSchemaLocation>
        <schemaCompletionMode>strict</schemaCompletionMode>
        <freeSchemaLocation>false</freeSchemaLocation>
        <metadata>
            <entry key="json">true</entry>
            <entry key="jsonp">true</entry>
        </metadata>
    </wfs>' \
    "$GEOSERVER_URL/rest/services/wfs"

# Configure GeoWebCache (tile caching)
echo "Configuring GeoWebCache..."
curl -X PUT \
    -u "$GEOSERVER_USER:$GEOSERVER_PASSWORD" \
    -H "Content-Type: application/xml" \
    -d '<gwcDiskQuota>
        <enabled>true</enabled>
        <maxTiles>10000</maxTiles>
        <minTiles>100</minTiles>
        <quotaUnits>MB</quotaUnits>
    </gwcDiskQuota>' \
    "$GEOSERVER_URL/rest/gwcConfig/diskquota"

echo "GeoServer setup complete!"
echo "Access GeoServer at: http://localhost:8080/geoserver"
echo "WMS endpoint: $GEOSERVER_URL/wms"
echo "WFS endpoint: $GEOSERVER_URL/wfs"