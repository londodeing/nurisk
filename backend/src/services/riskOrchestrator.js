/**
 * Risk Orchestrator Service
 * ===================
 * Main orchestration service that coordinates input fusion and decision modules
 */

const pool = require('../config/database');
const { DecisionModuleRegistry } = require('./decisionModuleRegistry');
const { InputFusionService } = require('./inputFusionService');

/**
 * RiskOrchestrator - Main orchestration class
 * Coordinates data fusion and decision module execution
 */
class RiskOrchestrator {
  constructor() {
    this.inputFusion = new InputFusionService();
    this.moduleRegistry = new DecisionModuleRegistry();
    this.initialized = false;
  }

  /**
   * Initialize the orchestrator
   * Registers default decision modules
   */
  async initialize() {
    if (this.initialized) {
      console.log('[RiskOrchestrator] Already initialized');
      return;
    }

    console.log('[RiskOrchestrator] Initializing...');
    
    // Register default decision modules
    await this._registerDefaultModules();
    
    this.initialized = true;
    console.log('[RiskOrchestrator] Initialized successfully');
  }

  /**
   * Register default decision modules
   */
  async _registerDefaultModules() {
    // Priority Assessment Module
    this.moduleRegistry.register({
      name: 'priority_assessment',
      version: '1.0.0',
      evaluate: async (context) => {
        const decisions = [];
        const { incident, weather } = context;

        if (!incident) {
          return decisions;
        }

        // Assess priority based on incident score and weather
        const score = incident.priority_score || 0;
        const level = incident.priority_level || 'LOW';

        // Generate priority-based decisions
        if (level === 'CRITICAL' || score > 1000) {
          decisions.push({
            recommendation: 'IMMEDIATE_RESPONSE: Deploy emergency response team within 30 minutes',
            rationale: `Critical incident with priority score ${score}. Immediate action required.`,
            score: 100,
            confidence: 0.95,
            urgency: 'CRITICAL',
            actionBy: 'COMMANDER',
            module: 'priority_assessment'
          });
        } else if (level === 'HIGH' || score > 500) {
          decisions.push({
            recommendation: 'URGENT_RESPONSE: Deploy response team within 2 hours',
            rationale: `High priority incident with score ${score}. Urgent response needed.`,
            score: 80,
            confidence: 0.85,
            urgency: 'HIGH',
            actionBy: 'FIELD_STAFF',
            module: 'priority_assessment'
          });
        } else if (level === 'MEDIUM' || score > 200) {
          decisions.push({
            recommendation: 'SCHEDULED_RESPONSE: Include in next response cycle',
            rationale: `Medium priority incident with score ${score}. Schedule for response.`,
            score: 60,
            confidence: 0.75,
            urgency: 'MEDIUM',
            actionBy: 'RELAWAN',
            module: 'priority_assessment'
          });
        } else {
          decisions.push({
            recommendation: 'MONITOR: Continue monitoring incident',
            rationale: `Low priority incident with score ${score}. Monitor for changes.`,
            score: 40,
            confidence: 0.65,
            urgency: 'LOW',
            actionBy: 'SYSTEM',
            module: 'priority_assessment'
          });
        }

        // Weather factor
        if (weather && weather.flood_risk_level) {
          if (weather.flood_risk_level === 'EXTREME') {
            decisions.push({
              recommendation: 'EVACUATION: Initiate flood evacuation protocol',
              rationale: `Extreme flood risk detected: ${weather.flood_risk_level}. Evacuation required.`,
              score: 95,
              confidence: 0.9,
              urgency: 'CRITICAL',
              actionBy: 'COMMANDER',
              module: 'priority_assessment'
            });
          } else if (weather.flood_risk_level === 'HIGH') {
            decisions.push({
              recommendation: 'PREPARE_EVACUATION: Prepare evacuation if conditions worsen',
              rationale: `High flood risk: ${weather.flood_risk_level}. Prepare for evacuation.`,
              score: 75,
              confidence: 0.8,
              urgency: 'HIGH',
              actionBy: 'FIELD_STAFF',
              module: 'priority_assessment'
            });
          }
        }

        return decisions;
      }
    });

    // Resource Allocation Module
    this.moduleRegistry.register({
      name: 'resource_allocation',
      version: '1.0.0',
      evaluate: async (context) => {
        const decisions = [];
        const { resources, incident } = context;

        if (!resources || !incident) {
          return decisions;
        }

        const { volunteers, assets, shelters } = resources;

        // Volunteer allocation
        if (volunteers && volunteers.length > 0) {
          const availableVolunteers = volunteers.filter(v => v.status === 'available');
          
          if (availableVolunteers.length === 0) {
            decisions.push({
              recommendation: 'REQUEST_VOLUNTEERS: Issue volunteer request',
              rationale: 'No available volunteers in area. Request additional volunteers.',
              score: 70,
              confidence: 0.8,
              urgency: 'HIGH',
              actionBy: 'VOLUNTEER_COORDINATOR',
              module: 'resource_allocation'
            });
          } else {
            const nearest = availableVolunteers[0];
            decisions.push({
              recommendation: `DEPLOY_VOLUNTEER: Deploy ${nearest.full_name} (${nearest.expertise})`,
              rationale: `Available volunteer ${nearest.full_name} at ${nearest.distance_km}km distance.`,
              score: 85,
              confidence: 0.85,
              urgency: 'MEDIUM',
              actionBy: 'VOLUNTEER_COORDINATOR',
              module: 'resource_allocation'
            });
          }
        }

        // Shelter allocation
        if (shelters && shelters.length > 0) {
          const availableShelters = shelters.filter(s => s.status === 'AKTIF' && s.current_occupants < s.capacity);
          
          if (availableShelters.length > 0) {
            const shelter = availableShelters[0];
            decisions.push({
              recommendation: `ACTIVATE_SHELTER: Open ${shelter.name} for evacuation`,
              rationale: `Shelter ${shelter.name} has ${shelter.capacity - shelter.current_occupants} available spots.`,
              score: 80,
              confidence: 0.9,
              urgency: 'HIGH',
              actionBy: 'LOGISTICS',
              module: 'resource_allocation'
            });
          }
        }

        // Asset allocation
        if (assets && assets.length > 0) {
          const availableAssets = assets.filter(a => a.status === 'available');
          
          if (availableAssets.length > 0) {
            decisions.push({
              recommendation: `DEPLOY_ASSETS: Dispatch ${availableAssets.length} available assets`,
              rationale: `${availableAssets.length} assets available for incident response.`,
              score: 75,
              confidence: 0.85,
              urgency: 'MEDIUM',
              actionBy: 'LOGISTICS',
              module: 'resource_allocation'
            });
          }
        }

        return decisions;
      }
    });

    // Agent Analysis Module
    this.moduleRegistry.register({
      name: 'agent_analysis',
      version: '1.0.0',
      evaluate: async (context) => {
        const decisions = [];
        const { agent } = context;

        if (!agent || !agent.analysis) {
          return decisions;
        }

        // Use agent confidence to determine decision weight
        const confidence = agent.confidence || 0.5;
        
        decisions.push({
          recommendation: agent.recommendations?.primary || 'REVIEW_ANALYSIS: Review agent analysis',
          rationale: `Agent analysis: ${agent.analysis.substring(0, 200)}...`,
          score: Math.round(confidence * 100),
          confidence: confidence,
          urgency: confidence > 0.8 ? 'HIGH' : 'MEDIUM',
          actionBy: 'TENAGA_AHLI',
          module: 'agent_analysis'
        });

        return decisions;
      }
    });

    console.log('[RiskOrchestrator] Registered default modules');
  }

  /**
   * Process an incident and return orchestrator output
   * @param {number} incidentId - Incident ID
   * @returns {Promise<OrchestratorOutput>}
   */
  async processIncident(incidentId) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`[RiskOrchestrator] Processing incident ${incidentId}`);

    // Step 1: Fuse inputs
    const context = await this.inputFusion.fuseInputs(incidentId);

    // Step 2: Execute decision modules in parallel
    const allDecisions = await this.moduleRegistry.evaluateAll(context);

    // Step 3: Rank and format output
    const output = this._formatOutput(incidentId, allDecisions);

    console.log(`[RiskOrchestrator] Generated ${output.decisions.length} decisions for incident ${incidentId}`);
    
    return output;
  }

  /**
   * Format output with ranked decisions
   * @param {number} incidentId 
   * @param {Decision[]} decisions 
   * @returns {OrchestratorOutput}
   */
  _formatOutput(incidentId, decisions) {
    // Rank by composite score with tie-breaking by urgency
    const urgencyOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    
    const ranked = decisions.sort((a, b) => {
      // Primary: composite score (descending)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Tie-breaker: urgency (descending)
      return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
    });

    // Calculate overall confidence
    const totalConfidence = ranked.length > 0
      ? ranked.reduce((sum, d) => sum + d.confidence, 0) / ranked.length
      : 0;

    return {
      incident_id: incidentId,
      decisions: ranked,
      total_confidence: Math.round(totalConfidence * 100) / 100,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Get registered modules
   * @returns {Array}
   */
  getModules() {
    return this.moduleRegistry.getAll();
  }
}

// Export singleton instance
const riskOrchestrator = new RiskOrchestrator();

module.exports = {
  RiskOrchestrator,
  riskOrchestrator
};