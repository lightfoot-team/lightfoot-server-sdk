import { FlagEnrichmentHook } from "./hook";
import { MyFeatureProvider } from "./provider";
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
    
    // Set up provider
    const featureFlagProvider = new MyFeatureProvider(this.config);
    OpenFeature.setProvider(featureFlagProvider);
    
    // Create client
    this.featureFlagsClient = OpenFeature.getClient();
  }

  init() {
    this.sdk.start();
    this.featureFlagsClient.addHooks(new MetricsHook());
    this.featureFlagsClient.addHooks(new FlagEnrichmentHook());
    // this.featureFlagsClient.addHooks(new TracingHook());
  }

  getClient() {
    return this.featureFlagsClient;
  }
}

export default LightFootSDK;
export { LightFootSDK };
export { defaultConfig };