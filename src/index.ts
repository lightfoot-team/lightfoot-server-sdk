import { FlagEnrichmentHook } from "./hook";
import { MyFeatureProvider } from "./provider";
import { OpenFeature } from "@openfeature/server-sdk";
import { MetricsHook, TracingHook } from "@openfeature/open-telemetry-hooks";
// import { context, trace } from '@opentelemetry/api';
import { metrics, context, trace } from '@opentelemetry/api';
import { sdk, telemetryMiddleware } from './telemetry';

// set up provider
const featureFlagProvider = new MyFeatureProvider();
OpenFeature.setProvider(featureFlagProvider);

// set up hooks
// OpenFeature.addHooks(new MetricsHook());
// OpenFeature.addHooks(new FlagEnrichmentHook());
// OpenFeature.addHooks(new TracingHook());

export const testTelemetryMiddleware = telemetryMiddleware;

// expose client
export const featureFlagsClient = OpenFeature.getClient();
// featureFlagsClient.addHooks(new MetricsHook());
// featureFlagsClient.addHooks(new FlagEnrichmentHook());
// featureFlagsClient.addHooks(new TracingHook());
// expose async func to start the SDK
export const init = () => {
  sdk.start();
  featureFlagsClient.addHooks(new MetricsHook());
  featureFlagsClient.addHooks(new FlagEnrichmentHook());
  featureFlagsClient.addHooks(new TracingHook());

};
