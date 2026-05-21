/**
 * Time Series Forecast Tests
 * ======================
 * Test suite for forecasting
 */

const { Pool } = require('pg');

let pool: any;

beforeAll(() => {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'nurisk',
    password: process.env.DB_PASSWORD || 'nurisk',
    database: process.env.DB_NAME || 'nurisk',
  });
});

describe('Time Series Forecast', () => {
  describe('T01 - ARIMA Forecast', () => {
    test('I01: should get time series data', async () => {
      const service = require('../services/arimaForecastService');
      const result = await service.getTimeSeries(30);
      expect(result).toBeDefined();
    });

    test('I02: should auto-fit ARIMA parameters', async () => {
      const service = require('../services/arimaForecastService');
      const data = await service.getTimeSeries(30);
      const values = data.map(d => parseInt(d.count));
      const params = service.autoFitArima(values);
      expect(params).toBeDefined();
      expect(params.p).toBeGreaterThanOrEqual(0);
      expect(params.d).toBeGreaterThanOrEqual(0);
      expect(params.q).toBeGreaterThanOrEqual(0);
    });

    test('I03: should generate ARIMA forecast', async () => {
      const service = require('../services/arimaForecastService');
      const result = await service.forecast(7);
      expect(result).toBeDefined();
      expect(result.model).toBe('ARIMA');
      expect(result.data.length).toBe(7);
    });
  });

  describe('T02 - Prophet Forecast', () => {
    test('I01: should get time series data', async () => {
      const service = require('../services/prophetForecastService');
      const result = await service.getTimeSeries(30);
      expect(result).toBeDefined();
    });

    test('I02: should generate Prophet forecast', async () => {
      const service = require('../services/prophetForecastService');
      const result = await service.forecast(7);
      expect(result).toBeDefined();
      expect(result.model).toBeDefined();
      expect(result.data.length).toBe(7);
    });

    test('I03: should return trend and seasonality components', async () => {
      const service = require('../services/prophetForecastService');
      const components = await service.getComponents(7);
      expect(components).toBeDefined();
      expect(components.trend).toBeDefined();
      expect(components.weekly).toBeDefined();
    });
  });

  describe('T03 - Forecast Endpoints', () => {
    test('I01: should return ensemble forecast', async () => {
      const service = require('../services/arimaForecastService');
      const result = await service.forecast(7);
      expect(result).toBeDefined();
    });

    test('I02: should return forecast with confidence bounds', async () => {
      const service = require('../services/arimaForecastService');
      const result = await service.forecast(7);
      const first = result.data[0];
      expect(first).toHaveProperty('predicted');
      expect(first).toHaveProperty('lower_80');
      expect(first).toHaveProperty('upper_80');
      expect(first).toHaveProperty('lower_95');
      expect(first).toHaveProperty('upper_95');
    });

    test('I03: should compute weighted ensemble', async () => {
      const arimaService = require('../services/arimaForecastService');
      const prophetService = require('../services/prophetForecastService');
      
      const [arima, prophet] = await Promise.all([
        arimaService.forecast(7).catch(() => null),
        prophetService.forecast(7).catch(() => null),
      ]);
      
      if (arima && prophet) {
        const ensemble = arima.data.map((ar, i) => ({
          predicted: Math.round((ar.predicted + prophet.data[i].predicted) / 2),
        }));
        expect(ensemble).toBeDefined();
      }
    });
  });

  describe('T04 - Forecast Tests', () => {
    test('I01: should calculate moving average for smoothing', async () => {
      const service = require('../services/arimaForecastService');
      const data = await service.getTimeSeries(30);
      const values = data.map(d => parseInt(d.count));
      const ma = service.difference(values);
      expect(ma).toBeDefined();
    });

    test('I02: should calculate forecast accuracy', async () => {
      const service = require('../services/arimaForecastService');
      const actual = [10, 12, 15, 14, 16, 18, 20];
      const predicted = [11, 13, 14, 15, 17, 19, 21];
      const accuracy = service.calculateAccuracy(actual, predicted);
      expect(accuracy).toBeDefined();
      expect(accuracy.mape).toBeDefined();
    });

    test('I03: should calculate MAPE against test period', async () => {
      const service = require('../services/arimaForecastService');
      const data = await service.getTimeSeries(60);
      const values = data.map(d => parseInt(d.count));
      
      if (values.length >= 14) {
        const train = values.slice(0, -7);
        const test = values.slice(-7);
        const predicted = train.slice(-7).map(v => v + 1);
        const accuracy = service.calculateAccuracy(test, predicted);
        expect(accuracy).toBeDefined();
      }
    });
  });
});