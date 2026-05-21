import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import axios from 'axios';

export interface FusionInput {
  id: string;
  type: 'social_media' | 'news' | 'sensor' | 'field_report';
  source: string;
  sourceDetail: string;
  content: string;
  location?: { lat: number; lng: number };
  timestamp: Date;
  metadata: Record<string, any>;
  raw?: any;
}

export interface FusionResult {
  eventId: string;
  inputs: FusionInput[];
  location: { lat: number; lng: number };
  disasterType?: string;
  severity: number;
  confidence: number;
  mergedContent: string;
  verified: boolean;
}

interface SourceConfig {
  api?: string;
  reliability: number;
}

type SourceConfigs = Record<FusionInput['type'], Record<string, SourceConfig>>;

@Injectable()
export class InputFusionService {
  private readonly logger = new Logger(InputFusionService.name);

  // Source configurations
  private readonly sourceConfigs: SourceConfigs = {
    social_media: {
      twitter: { api: process.env.TWITTER_API, reliability: 0.3 },
      facebook: { api: process.env.FACEBOOK_API, reliability: 0.3 },
    },
    news: {
      bmkg: { api: process.env.BMKG_API, reliability: 0.9 },
      magmacu: { api: process.env.MAGMA_API, reliability: 0.8 },
      rss: { api: process.env.RSS_API, reliability: 0.5 },
    },
    sensor: {
      bmkg: { api: process.env.BMKG_SENSOR_API, reliability: 0.9 },
      magma: { api: process.env.MAGMA_SENSOR_API, reliability: 0.9 },
    },
    field_report: {
      volunteer: { reliability: 1.0 },
      nsu: { reliability: 1.0 },
    },
  };

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Fetch and normalize inputs from all sources
   */
  async fetchAllSources(): Promise<FusionInput[]> {
    const results: FusionInput[] = [];

    // Fetch in parallel
    const [social, news, sensors, field] = await Promise.allSettled([
      this.fetchSocialMedia(),
      this.fetchNews(),
      this.fetchSensors(),
      this.fetchFieldReports(),
    ]);

    if (social.status === 'fulfilled') results.push(...social.value);
    if (news.status === 'fulfilled') results.push(...news.value);
    if (sensors.status === 'fulfilled') results.push(...sensors.value);
    if (field.status === 'fulfilled') results.push(...field.value);

    return results;
  }

  /**
   * Fetch social media inputs
   */
  async fetchSocialMedia(): Promise<FusionInput[]> {
    const inputs: FusionInput[] = [];

    // Twitter
    try {
      const tweets = await this.fetchTwitter();
      inputs.push(...tweets.map((t: any) => ({
        id: `twitter-${t.id}`,
        type: 'social_media' as const,
        source: 'twitter',
        sourceDetail: t.user?.screen_name,
        content: t.text,
        location: t.location,
        timestamp: new Date(t.created_at),
        metadata: { followers: t.followers, retweets: t.retweets },
        raw: t,
      })));
    } catch (e) {
      this.logger.warn(`Twitter fetch failed: ${e}`);
    }

    // Facebook
    try {
      const posts = await this.fetchFacebook();
      inputs.push(...posts.map((p: any) => ({
        id: `facebook-${p.id}`,
        type: 'social_media' as const,
        source: 'facebook',
        sourceDetail: p.from?.name,
        content: p.message,
        location: p.location,
        timestamp: new Date(p.created_time),
        metadata: { reactions: p.reactions?.summary?.total_count },
        raw: p,
      })));
    } catch (e) {
      this.logger.warn(`Facebook fetch failed: ${e}`);
    }

    return inputs;
  }

  /**
   * Fetch news feeds
   */
  async fetchNews(): Promise<FusionInput[]> {
    const inputs: FusionInput[] = [];

    // BMKG
    try {
      const bmkg = await this.fetchBMKG();
      inputs.push(...bmkg.map((b: any) => ({
        id: `bmkg-${b.id}`,
        type: 'news' as const,
        source: 'bmkg',
        sourceDetail: 'BMKG',
        content: b.title,
        location: b.coordinates,
        timestamp: new Date(b.time),
        metadata: { magnitude: b.magnitude, depth: b.depth },
        raw: b,
      })));
    } catch (e) {
      this.logger.warn(`BMKG fetch failed: ${e}`);
    }

    // RSS
    try {
      const rss = await this.fetchRSS();
      inputs.push(...rss.map((r: any) => ({
        id: `rss-${r.guid}`,
        type: 'news' as const,
        source: 'rss',
        sourceDetail: r.feed,
        content: r.title,
        location: r.location,
        timestamp: new Date(r.pubDate),
        metadata: { link: r.link },
        raw: r,
      })));
    } catch (e) {
      this.logger.warn(`RSS fetch failed: ${e}`);
    }

    return inputs;
  }

  /**
   * Fetch sensor data
   */
  async fetchSensors(): Promise<FusionInput[]> {
    const inputs: FusionInput[] = [];

    // BMKG Sensor
    try {
      const sensors = await this.fetchBMKGSensor();
      inputs.push(...sensors.map((s: any) => ({
        id: `sensor-bmkg-${s.station}`,
        type: 'sensor' as const,
        source: 'bmkg',
        sourceDetail: s.station,
        content: `Sensor ${s.station}: ${s.value}${s.unit}`,
        location: { lat: s.lat, lng: s.lng },
        timestamp: new Date(s.time),
        metadata: { value: s.value, unit: s.unit, threshold: s.threshold },
        raw: s,
      })));
    } catch (e) {
      this.logger.warn(`BMKG sensor fetch failed: ${e}`);
    }

    // MAGMA
    try {
      const magma = await this.fetchMAGMA();
      inputs.push(...magma.map((m: any) => ({
        id: `sensor-magma-${m.id}`,
        type: 'sensor' as const,
        source: 'magma',
        sourceDetail: 'MAGMA Indonesia',
        content: `Volcano ${m.volcano}: ${m.status}`,
        location: { lat: m.lat, lng: m.lng },
        timestamp: new Date(m.last_updated),
        metadata: { status: m.status, alert_level: m.alert_level },
        raw: m,
      })));
    } catch (e) {
      this.logger.warn(`MAGMA fetch failed: ${e}`);
    }

    return inputs;
  }

  /**
   * Fetch field reports
   */
  async fetchFieldReports(): Promise<FusionInput[]> {
    // This would typically fetch from the database
    // For now, return empty - will be populated by volunteer app
    return [];
  }

  /**
   * Fuse multiple inputs into a single event
   */
  async fuseInputs(inputs: FusionInput[]): Promise<FusionResult[]> {
    // Group by location (within 10km)
    const groups = this.groupByLocation(inputs, 10);

    const results: FusionResult[] = [];

    for (const group of groups) {
      const fused = await this.fuseGroup(group);
      if (fused) results.push(fused);
    }

    return results;
  }

  /**
   * Group inputs by location
   */
  private groupByLocation(inputs: FusionInput[], radiusKm: number): FusionInput[][] {
    const groups: FusionInput[][] = [];
    const processed = new Set<string>();

    for (const input of inputs) {
      if (!input.location || processed.has(input.id)) continue;

      const group: FusionInput[] = [input];
      processed.add(input.id);

      for (const other of inputs) {
        if (!other.location || processed.has(other.id)) continue;

        const distance = this.calculateDistance(
          input.location,
          other.location
        );

        if (distance <= radiusKm) {
          group.push(other);
          processed.add(other.id);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Fuse a group of inputs
   */
  private async fuseGroup(inputs: FusionInput[]): Promise<FusionResult | null> {
    if (inputs.length === 0) return null;

    // Calculate average location
    const lats = inputs.map((i) => i.location!.lat);
    const lngs = inputs.map((i) => i.location!.lng);
    const location = {
      lat: lats.reduce((a, b) => a + b) / lats.length,
      lng: lngs.reduce((a, b) => a + b) / lngs.length,
    };

    // Determine disaster type from content
    const disasterType = this.detectDisasterType(inputs);

    // Calculate severity
    const severity = this.calculateSeverity(inputs);

    // Calculate confidence
    const confidence = this.calculateConfidence(inputs);

    // Merge content
    const mergedContent = this.mergeContent(inputs);

    // Check verification
    const verified = this.verifyInputs(inputs);

    // Generate event ID
    const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      eventId,
      inputs,
      location,
      disasterType,
      severity,
      confidence,
      mergedContent,
      verified,
    };
  }

  /**
   * Detect disaster type from content
   */
  private detectDisasterType(inputs: FusionInput[]): string {
    const keywords: Record<string, string[]> = {
      BANJIR: ['banjir', 'flood', 'air naik', 'genangan'],
      GEMPA: ['gempa', 'earthquake', 'quake', 'gempabumi'],
      TSUNAMI: ['tsunami', 'air laut naik'],
      LONGSOR: ['longsor', 'landslide', 'tanah longsor'],
      KEBAKARAN: ['kebakaran', 'fire', 'api', ' terbakar'],
      PUTING_BELIANG: ['puting beli', 'angin topan', 'typhoon'],
      TANAH_LONGSOR: ['longsor', 'landslide'],
      ERUPSI: ['erupsi', 'letusan', 'vulcanian'],
    };

    const allContent = inputs.map((i) => i.content.toLowerCase()).join(' ');

    for (const [type, words] of Object.entries(keywords)) {
      if (words.some((w) => allContent.includes(w))) {
        return type;
      }
    }

    return 'UNKNOWN';
  }

  /**
   * Calculate severity from inputs
   */
  private calculateSeverity(inputs: FusionInput[]): number {
    const severities = inputs.map((i) => {
      let score = 50;

      // Adjust by source type
      if (i.type === 'sensor') score += 30;
      if (i.type === 'field_report') score += 40;
      if (i.type === 'news') score += 20;
      if (i.type === 'social_media') score += 10;

      // Adjust by metadata
      if (i.metadata?.magnitude) score += Math.min(20, i.metadata.magnitude * 2);
      if (i.metadata?.alert_level) score += i.metadata.alert_level * 10;

      return Math.min(100, score);
    });

    return Math.round(severities.reduce((a, b) => a + b) / severities.length);
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(inputs: FusionInput[]): number {
    const reliabilities = inputs.map((i) => {
      const config = this.sourceConfigs[i.type]?.[i.source];
      return config?.reliability || 0.5;
    });

    const avgReliability =
      reliabilities.reduce((a, b) => a + b, 0) / reliabilities.length;

    // More sources = higher confidence
    const sourceBonus = Math.min(20, inputs.length * 5);

    return Math.min(100, Math.round(avgReliability * 100 + sourceBonus));
  }

  /**
   * Merge content from multiple sources
   */
  private mergeContent(inputs: FusionInput[]): string {
    const bySource: Record<string, string[]> = {};

    for (const input of inputs) {
      if (!bySource[input.source]) {
        bySource[input.source] = [];
      }
      bySource[input.source].push(input.content);
    }

    return Object.entries(bySource)
      .map(([source, contents]) => `[${source}] ${contents[0]}`)
      .join(' | ');
  }

  /**
   * Verify inputs
   */
  private verifyInputs(inputs: FusionInput[]): boolean {
    // If any field report, consider verified
    if (inputs.some((i) => i.type === 'field_report')) return true;

    // If multiple sources agree, consider verified
    const uniqueSources = new Set(inputs.map((i) => i.source));
    if (uniqueSources.size >= 2) return true;

    return false;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * c;
  }

  // API fetch methods (implement with actual APIs)
  private async fetchTwitter(): Promise<unknown[]> {
    // Placeholder - implement with actual Twitter API
    return [];
  }

  private async fetchFacebook(): Promise<unknown[]> {
    // Placeholder - implement with actual Facebook API
    return [];
  }

  private async fetchBMKG(): Promise<unknown[]> {
    try {
      const response = await axios.get(process.env.BMKG_API || '', { timeout: 5000 });
      return response.data?.gempa || [];
    } catch {
      return [];
    }
  }

  private async fetchRSS(): Promise<unknown[]> {
    // Placeholder - implement with RSS parser
    return [];
  }

  private async fetchBMKGSensor(): Promise<unknown[]> {
    try {
      const response = await axios.get(process.env.BMKG_SENSOR_API || '', { timeout: 5000 });
      return response.data?.sensor || [];
    } catch {
      return [];
    }
  }

  private async fetchMAGMA(): Promise<unknown[]> {
    try {
      const response = await axios.get(process.env.MAGMA_API || '', { timeout: 5000 });
      return response.data?.gunungapi || [];
    } catch {
      return [];
    }
  }
}