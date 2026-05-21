# Weather Analyst Prompt

## Task
Analyze weather data and forecast to assess flood and wind risks for disaster preparedness.

## Input
- Current weather conditions (temperature, humidity, wind speed, precipitation)
- 6-hour forecast data
- Geographic context (location, elevation, terrain type)
- Historical flood data for the area

## Instructions

### 1. Weather Interpretation
Analyze current conditions and forecast:
- Temperature and humidity trends
- Precipitation probability and expected amounts
- Wind speed and direction changes

### 2. Flood Risk Assessment
Combine precipitation forecast with terrain:
- Lowland areas (< 100m elevation): Higher flood risk
- Highland areas (> 500m elevation): Lower flood risk
- Coastal areas: Consider tidal effects

### 3. Wind Risk Assessment
Evaluate wind conditions:
- Strong wind warning for speeds > 25 m/s
- Tropical storm potential for speeds > 33 m/s

## Output Schema: WeatherAnalysisOutput

```json
{
  "location": {
    "latitude": number,
    "longitude": number,
    "region": string,
    "elevation_meters": number
  },
  "current": {
    "temperature_c": number,
    "humidity_percent": number,
    "wind_speed_ms": number,
    "wind_direction": string,
    "precipitation_mm": number,
    "timestamp": string
  },
  "forecast_6h": {
    "precipitation_mm": number,
    "temperature_c": number,
    "wind_speed_ms": number,
    "conditions": string
  },
  "summary": string,
  "floodRisk": {
    "level": "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME",
    "reasoning": string,
    "precipitation_6h_mm": number,
    "elevation_factor": string
  },
  "windWarning": {
    "active": boolean,
    "level": "NONE" | "MODERATE" | "STRONG" | "SEVERE",
    "speed_ms": number,
    "reasoning": string
  },
  "recommendation": string,
  "analyzed_at": string
}
```

## Risk Level Thresholds

### Flood Risk
| 6h Rainfall | Elevation | Risk Level |
|------------|-----------|------------|
| < 20mm | Any | NONE |
| 20-50mm | > 500m | LOW |
| 20-50mm | 100-500m | MODERATE |
| 20-50mm | < 100m | HIGH |
| 50-100mm | Any | HIGH |
| > 100mm | Any | EXTREME |

### Wind Warning
| Wind Speed | Warning Level |
|-----------|-------------|
| < 10 m/s | NONE |
| 10-17 m/s | MODERATE |
| 17-25 m/s | STRONG |
| > 25 m/s | SEVERE |

## Geographic Context
- Java terrain: Generally low elevation in north, highlands in south
- River basins: Jakarta, Surabaya, Semarang - high flood risk
- Mountain areas: Dieng, Bromo - lower flood risk but landslide potential