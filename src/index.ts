import { FlagEnrichmentHook } from "./hook";
import { LightFootServerProvider } from "./provider";
import { OpenFeature } from "@openfeature/server-sdk";
import { MetricsHook } from "@openfeature/open-telemetry-hooks";
import { createSDK } from './telemetry';
import { SDKConfig, defaultConfig } from "./config/config";

class LightFootSDK {
  private sdk: any;
  private featureFlagsClient;
  private config: SDKConfig;

  constructor(config: SDKConfig) {
    this.config = config;
    this.sdk = createSDK(this.config);
    
    const featureFlagProvider = new LightFootServerProvider(this.config);
    OpenFeature.setProvider(featureFlagProvider);
    
    this.featureFlagsClient = OpenFeature.getClient();
  }

  init() {
    this.sdk.start();
    this.featureFlagsClient.addHooks(new MetricsHook());
    this.featureFlagsClient.addHooks(new FlagEnrichmentHook());
  }

  getClient() {
    return this.featureFlagsClient;
  }
}

export default LightFootSDK;
export { LightFootSDK };
export { defaultConfig };