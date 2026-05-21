/**
 * Forecast Controller
 * ===================
 * REST API controller for forecasting
 */

const arimaService = require('../services/arimaForecastService');
const prophetService = require('../services/prophetForecastService');

/**
 * Get incident forecast
 * GET /analytics/forecast/incidents?days=7&model=arima|prophet|ensemble
 */
async function getIncidentForecast(req, res) {
  try {
    const { days = 7, model = 'ensemble', type } = req.query;
    const horizon = parseInt(days);
    
    let result;
    
    switch (model.toLowerCase()) {
      case 'arima':
        result = await arimaService.forecast(horizon, type);
        break;
        
      case 'prophet':
        result = await prophetService.forecast(horizon, type);
        break;
        
      case 'ensemble':
      default:
        // Get both forecasts and combine
        const [arimaResult, prophetResult] = await Promise.all([
          arimaService.forecast(horizon, type).catch(() => null),
          prophetService.forecast(horizon, type).catch(() => null),
        ]);
        
        if (arimaResult && prophetResult) {
          // Weighted ensemble (equal weights)
          result = {
            model: 'Ensemble',
            data: arimaResult.data.map((ar, i) => ({
              date: ar.date,
              predicted: Math.round((ar.predicted + prophetResult.data[i].predicted) / 2),
              lower_80: Math.round((ar.lower_80 + prophetResult.data[i].lower_80) / 2),
              upper_80: Math.round((ar.upper_80 + prophetResult.data[i].upper_80) / 2),
              lower_95: Math.round((ar.lower_95 + prophetResult.data[i].lower_95) / 2),
              upper_95: Math.round((ar.upper_95 + prophetResult.data[i].upper_95) / 2),
            })),
            metadata: {
              history_days: Math.max(arimaResult.metadata.history_days, prophetResult.metadata.history_days),
              forecast_days: horizon,
              models: ['ARIMA', 'Prophet'],
              weights: [0.5, 0.5],
              type_filter: type || 'all',
            },
          };
        } else if (arimaResult) {
          result = arimaResult;
        } else if (prophetResult) {
          result = prophetResult;
        } else {
          throw new Error('No forecast models available');
        }
        break;
    }
    
    res.json({
      success: true,
      data: result.data,
      meta: result.metadata,
    });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get ARIMA forecast
 * GET /analytics/forecast/arima?days=7&type=BANJIR
 */
async function getArimaForecast(req, res) {
  try {
    const { days = 7, type } = req.query;
    const result = await arimaService.forecast(parseInt(days), type);
    
    res.json({
      success: true,
      data: result.data,
      meta: result.metadata,
    });
  } catch (error) {
    console.error('ARIMA forecast error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get Prophet forecast
 * GET /analytics/forecast/prophet?days=7&type=BANJIR
 */
async function getProphetForecast(req, res) {
  try {
    const { days = 7, type } = req.query;
    const result = await prophetService.forecast(parseInt(days), type);
    
    res.json({
      success: true,
      data: result.data,
      meta: result.metadata,
    });
  } catch (error) {
    console.error('Prophet forecast error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get forecast components
 * GET /analytics/forecast/components?days=7
 */
async function getForecastComponents(req, res) {
  try {
    const { days = 7 } = req.query;
    const components = await prophetService.getComponents(parseInt(days));
    
    res.json({
      success: true,
      data: components,
    });
  } catch (error) {
    console.error('Forecast components error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get forecast accuracy metrics
 * GET /analytics/forecast/accuracy?days=7
 */
async function getForecastAccuracy(req, res) {
  try {
    const { days = 7, type } = req.query;
    const horizon = parseInt(days);
    
    // Get historical data for accuracy calculation
    const history = await arimaService.getTimeSeries(60 + horizon, type);
    const values = history.map(d => parseInt(d.count));
    
    if (values.length < horizon + 14) {
      return res.json({
        success: true,
        data: { error: 'Insufficient data for accuracy calculation' },
      });
    }
    
    // Split into train and test
    const train = values.slice(0, -horizon);
    const test = values.slice(-horizon);
    
    // Generate forecast on train data
    const trainData = history.slice(0, -horizon);
    const forecast = await arimaService.forecast(horizon, type);
    const predicted = forecast.data.map(d => d.predicted);
    
    // Calculate accuracy
    const accuracy = arimaService.calculateAccuracy(test, predicted);
    
    res.json({
      success: true,
      data: {
        mape: accuracy.mape?.toFixed(2),
        rmse: accuracy.rmse?.toFixed(2),
        mae: accuracy.mae?.toFixed(2),
        test_period_days: horizon,
        training_period_days: train.length,
      },
    });
  } catch (error) {
    console.error('Forecast accuracy error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getIncidentForecast,
  getArimaForecast,
  getProphetForecast,
  getForecastComponents,
  getForecastAccuracy,
};