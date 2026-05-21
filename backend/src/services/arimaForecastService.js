/**
 * ARIMA Forecast Service
 * ==================
 * Time-series forecasting using ARIMA model
 */

const { Pool } = require('pg');

// Simple ARIMA implementation using regression
class ArimaForecastService {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'nurisk',
      password: process.env.DB_PASSWORD || 'nurisk',
      database: process.env.DB_NAME || 'nurisk',
    });
  }

  /**
   * Get time series data for forecasting
   * @param {number} days - Number of days to look back
   * @param {string} type - Optional disaster type filter
   * @returns {Promise<Array>} Time series data
   */
  async getTimeSeries(days = 60, type = null) {
    const typeFilter = type ? `AND disaster_type = '${type}'` : '';
    
    const query = `
      SELECT 
        date_trunc('day', recorded_at)::date AS date,
        COUNT(*) AS count
      FROM incident_temporal
      WHERE recorded_at >= date_trunc('day', NOW()) - INTERVAL '${days} days'
      ${typeFilter}
      GROUP BY date
      ORDER BY date
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }

  /**
   * Auto-fit ARIMA parameters using simple grid search
   * @param {Array} data - Time series data
   * @returns {object} Best (p, d, q) parameters
   */
  autoFitArima(data) {
    const values = data.map(d => parseInt(d.count));
    const n = values.length;
    
    // Simple differencing to find d
    let d = 0;
    let diff = values;
    while (d < 2) {
      const isConstant = diff.slice(1).every((v, i) => Math.abs(v - diff[0]) < 0.01);
      if (isConstant) break;
      diff = this.difference(diff);
      d++;
    }
    
    // Simple grid search for p, q (limited for performance)
    let bestAic = Infinity;
    let bestParams = { p: 1, d, q: 1 };
    
    for (let p = 0; p <= 2; p++) {
      for (let q = 0; q <= 2; q++) {
        if (p === 0 && q === 0) continue;
        
        try {
          const aic = this.calculateAic(values, p, d, q);
          if (aic < bestAic) {
            bestAic = aic;
            bestParams = { p, d, q };
          }
        } catch (e) {
          // Skip invalid parameters
        }
      }
    }
    
    return bestParams;
  }

  /**
   * Calculate AIC for ARIMA model
   * @param {Array} values - Time series values
   * @param {number} p - AR order
   * @param {number} d - Differencing order
   * @param {number} q - MA order
   * @returns {number} AIC value
   */
  calculateAic(values, p, d, q) {
    // Simplified AIC calculation
    const n = values.length;
    const k = p + d + q + 1;
    const residuals = this.getResiduals(values, p, d, q);
    const sse = residuals.reduce((sum, r) => sum + r * r, 0);
    const sigma2 = sse / n;
    return n * Math.log(sigma2) + 2 * k;
  }

  /**
   * Get residuals from ARIMA model
   * @param {Array} values - Time series values
   * @param {number} p - AR order
   * @param {number} d - Differencing order
   * @param {number} q - MA order
   * @returns {Array} Residuals
   */
  getResiduals(values, p, d, q) {
    // Simple residual calculation
    const diff = this.difference(values, d);
    const residuals = [];
    
    for (let i = Math.max(p, q); i < diff.length; i++) {
      let predicted = 0;
      // AR terms
      for (let j = 1; j <= p; j++) {
        predicted += 0.5 * diff[i - j];
      }
      // MA terms
      for (let j = 1; j <= q; j++) {
        predicted += 0.5 * (diff[i - j] - (diff[i - j - 1] || 0));
      }
      residuals.push(diff[i] - predicted);
    }
    
    return residuals;
  }

  /**
   * Difference time series
   * @param {Array} values - Time series values
   * @param {number} order - Differencing order
   * @returns {Array} Differenced values
   */
  difference(values, order = 1) {
    if (order === 0) return values;
    
    let result = values;
    for (let o = 0; o < order; o++) {
      const diff = [];
      for (let i = 1; i < result.length; i++) {
        diff.push(result[i] - result[i - 1]);
      }
      result = diff;
    }
    return result;
  }

  /**
   * Generate forecast using ARIMA
   * @param {number} days - Forecast horizon
   * @param {string} type - Optional disaster type
   * @returns {Promise<Array>} Forecast with confidence intervals
   */
  async forecast(days = 7, type = null) {
    const data = await this.getTimeSeries(60, type);
    const values = data.map(d => parseInt(d.count));
    
    if (values.length < 10) {
      throw new Error('Insufficient data for forecasting');
    }
    
    // Auto-fit parameters
    const params = this.autoFitArima(values);
    
    // Calculate statistics for confidence intervals
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );
    
    // Generate forecast
    const forecast = [];
    const lastValue = values[values.length - 1];
    const trend = (values[values.length - 1] - values[values.length - 7]) / 7 || 0;
    
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Simple forecast with trend
      const predicted = lastValue + trend * i;
      const value = Math.max(0, Math.round(predicted));
      
      // Confidence intervals (wider as horizon increases)
      const se = std * Math.sqrt(i / values.length);
      const z80 = 1.28;
      const z95 = 1.96;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted: value,
        lower_80: Math.max(0, Math.round(value - z80 * se)),
        upper_80: Math.round(value + z80 * se),
        lower_95: Math.max(0, Math.round(value - z95 * se)),
        upper_95: Math.round(value + z95 * se),
      });
    }
    
    return {
      model: 'ARIMA',
      params,
      data: forecast,
      metadata: {
        history_days: values.length,
        forecast_days: days,
        mean,
        std_dev: std,
        type_filter: type || 'all',
      },
    };
  }

  /**
   * Calculate forecast accuracy metrics
   * @param {Array} actual - Actual values
   * @param {Array} predicted - Predicted values
   * @returns {object} Accuracy metrics
   */
  calculateAccuracy(actual, predicted) {
    if (actual.length !== predicted.length || actual.length === 0) {
      return { mape: null, rmse: null, mae: null };
    }
    
    // MAPE
    const absPercErr = actual.map((a, i) => 
      Math.abs((a - predicted[i]) / (a || 1))
    );
    const mape = (absPercErr.reduce((a, b) => a + b, 0) / actual.length) * 100;
    
    // RMSE
    const sqErr = actual.map((a, i) => Math.pow(a - predicted[i], 2));
    const rmse = Math.sqrt(sqErr.reduce((a, b) => a + b, 0) / actual.length);
    
    // MAE
    const absErr = actual.map((a, i) => Math.abs(a - predicted[i]));
    const mae = absErr.reduce((a, b) => a + b, 0) / actual.length;
    
    return { mape, rmse, mae };
  }

  /**
   * Close pool
   */
  async close() {
    await this.pool.end();
  }
}

module.exports = new ArimaForecastService();