import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Current stable version
const CURRENT_VERSION = 'v1';

// Version config
const versions = {
  v1: {
    status: 'stable',
    sunset: null,
    deprecated: false
  },
  v2: {
    status: 'beta',
    sunset: null,
    deprecated: false
  }
};

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const version = this.parseVersion(req);
    (req as any).apiVersion = version;
    (req as any).versionConfig = this.getVersionConfig(version);

    // Add deprecation headers if version is deprecated
    if ((req as any).versionConfig?.deprecated) {
      res.setHeader('Deprecation', 'true');
      if ((req as any).versionConfig?.sunset) {
        res.setHeader('Sunset', (req as any).versionConfig.sunset);
      }
    }

    // Add API-Version header to response
    res.setHeader('X-API-Version', version);

    next();
  }

  private parseVersion(req: Request): string {
    // Check URL path first (/api/v1/...)
    const pathMatch = (req as any).path?.match(/^\/v(\d+)\//);
    if (pathMatch) {
      return `v${pathMatch[1]}`;
    }

    // Check X-API-Version header
    const headerVersion = req.headers['x-api-version'];
    if (headerVersion) {
      const version = Array.isArray(headerVersion) ? headerVersion[0] : headerVersion;
      return version.startsWith('v') ? version : `v${version}`;
    }

    // Check Accept-Version header
    const acceptVersion = req.headers['accept-version'];
    if (acceptVersion) {
      const version = Array.isArray(acceptVersion) ? acceptVersion[0] : acceptVersion;
      return version.startsWith('v') ? version : `v${version}`;
    }

    return CURRENT_VERSION;
  }

  private getVersionConfig(version: string) {
    return versions[version as keyof typeof versions] || versions[CURRENT_VERSION];
  }
}