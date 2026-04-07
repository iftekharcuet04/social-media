import { Injectable } from '@nestjs/common';
import { platformCapabilities, PlatformCapability } from './platform-capabilities';

@Injectable()
export class PlatformCapabilitiesService {
  checkCapability(platform: string, action: keyof PlatformCapability): void {
    const caps = platformCapabilities[platform.toLowerCase()];
    
    if (!caps) {
      throw new Error(`Platform capabilities not defined for: ${platform}`);
    }
    
    if (!caps[action]) {
      throw new Error(`Capability ${action} is not supported for platform: ${platform}`);
    }
  }

  getCapabilities(platform: string): PlatformCapability {
    const caps = platformCapabilities[platform.toLowerCase()];
    
    if (!caps) {
      throw new Error(`Platform capabilities not defined for: ${platform}`);
    }
    
    return caps;
  }
}
