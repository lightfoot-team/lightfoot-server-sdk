import { FlagEnrichmentHook } from "./hook";
import { MyFeatureProvider } from "./provider";
import { OpenFeature } from "@openfeature/server-sdk";
import { MetricsHook, TracingHook } from "@openfeature/open-telemetry-hooks";
import { metrics, context, trace } from '@opentelemetry/api';
import { sdk, telemetryMiddleware } from './telemetry';

// set up provider
const featureFlagProvider = new MyFeatureProvider();
OpenFeature.setProvider(featureFlagProvider);

// expose client
export const featureFlagsClient = OpenFeature.getClient();

// expose async func to start the SDK
export const lightFoot = {
  init: () => {
  sdk.start();
  featureFlagsClient.addHooks(new MetricsHook());
  featureFlagsClient.addHooks(new FlagEnrichmentHook());
  featureFlagsClient.addHooks(new TracingHook());
  }
};
