/**
 * Orchestrator Domain Types
 * =================
 * Type definitions for the Risk Orchestrator system
 */

/**
 * @typedef {Object} OrchestratorInput
 * @property {IncidentData} incident - Incident data
 * @property {WeatherData} weather - Weather forecast data
 * @property {ResourceData} resource - Resource availability
 * @property {AgentData} agent - Agent analysis data
 * @property {string} [timestamp] - Unified timestamp (ISO 8601)
 */

/**
 * @typedef {Object} IncidentData
 * @property {number} id - Incident ID
 * @property {string} title - Incident title
 * @property {string} disaster_type - Type of disaster
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {string} region - Region name
 * @property {string} status - Incident status
 * @property {number} priority_score - AI-calculated priority score
 * @property {string} priority_level - Priority level (LOW/MEDIUM/HIGH/CRITICAL)
 * @property {Object} dampak_manusia - Human impact data
 * @property {Object} dampak_rumah - Property impact data
 * @property {Object} dampak_fasum - Public facility impact data
 * @property {Object} dampak_vital - Vital infrastructure impact data
 * @property {Object} dampak_lingkungan - Environmental impact data
 */

/**
 * @typedef {Object} WeatherData
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {string} region - Region name
 * @property {number} temperature_c - Current temperature in Celsius
 * @property {number} humidity_percent - Humidity percentage
 * @property {number} wind_speed_ms - Wind speed in m/s
 * @property {number} precipitation_mm - Current precipitation in mm
 * @property {number} precipitation_6h_mm - 6-hour precipitation forecast
 * @property {string} flood_risk_level - Flood risk level (NONE/LOW/MODERATE/HIGH/EXTREME)
 * @property {string} wind_risk_level - Wind risk level
 * @property {string} timestamp - Weather data timestamp
 */

/**
 * @typedef {Object} ResourceData
 * @property {VolunteerResource[]} volunteers - Available volunteers
 * @property {AssetResource[]} assets - Available assets
 * @property {ShelterResource[]} shelters - Available shelters
 */

/**
 * @typedef {Object} VolunteerResource
 * @property {number} id - Volunteer ID
 * @property {string} full_name - Volunteer name
 * @property {string} expertise - Special expertise
 * @property {string} status - Availability status
 * @property {number} latitude - Current latitude
 * @property {number} longitude - Current longitude
 * @property {number} distance_km - Distance to incident in km
 */

/**
 * @typedef {Object} AssetResource
 * @property {number} id - Asset ID
 * @property {string} name - Asset name
 * @property {string} category - Asset category
 * @property {number} quantity - Available quantity
 * @property {string} location - Storage location
 * @property {string} status - Availability status
 */

/**
 * @typedef {Object} ShelterResource
 * @property {number} id - Shelter ID
 * @property {string} name - Shelter name
 * @property {string} region - Shelter region
 * @property {number} capacity - Shelter capacity
 * @property {number} current_occupants - Current occupant count
 * @property {string} status - Shelter status
 */

/**
 * @typedef {Object} AgentData
 * @property {string} analysis - Agent analysis summary
 * @property {Object} recommendations - Agent recommendations
 * @property {number} confidence - Agent confidence score (0-1)
 * @property {string} timestamp - Analysis timestamp
 */

/**
 * @typedef {Object} OrchestratorOutput
 * @property {number} incident_id - Related incident ID
 * @property {Decision[]} decisions - Ranked list of decisions
 * @property {number} total_confidence - Overall confidence score
 * @property {string} generated_at - Output generation timestamp
 */

/**
 * @typedef {Object} Decision
 * @property {string} recommendation - Action recommendation
 * @property {string} rationale - Reasoning behind the decision
 * @property {number} score - Composite score (0-100)
 * @property {number} confidence - Confidence score (0-1)
 * @property {string} urgency - Urgency level (LOW/MEDIUM/HIGH/CRITICAL)
 * @property {string} actionBy - Recommended responsible party
 * @property {string} module - Source decision module
 */

/**
 * @typedef {Object} DecisionModule
 * @property {string} name - Module name
 * @property {string} version - Module version
 * @property {Function} evaluate - Evaluation function
 */

/**
 * Decision Module Interface
 * @interface DecisionModule
 */
class DecisionModule {
  /**
   * Module name
   * @type {string}
   */
  name;

  /**
   * Module version
   * @type {string}
   */
  version;

  /**
   * Evaluate context and return scored decisions
   * @param {OrchestratorInput} context - Input context
   * @returns {Promise<Decision[]>} Scored decisions
   */
  async evaluate(context) {
    throw new Error('evaluate() must be implemented by subclass');
  }
}

module.exports = {
  DecisionModule
};