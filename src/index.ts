import { FlagEnrichmentHook } from "./hook";
import { MyFeatureProvider } from "./provider";
import { OpenFeature } from "@openfeature/server-sdk";
import { MetricsHook, TracingHook } from "@openfeature/open-telemetry-hooks";

import { sdk, telemetryMiddleware } from './telemetry';

// set up provider
const featureFlagProvider = new MyFeatureProvider();
OpenFeature.setProvider(featureFlagProvider);

// set up hooks
OpenFeature.addHooks(new FlagEnrichmentHook());

//TODO: Need to find out how to make metrics from metrics hook (or our implementation)
// actually send to Otel collector 
OpenFeature.addHooks(new MetricsHook());

OpenFeature.addHooks(new TracingHook());

//TODO: figure out how to name this properly instead of test
export const testTelemetryMiddleware = telemetryMiddleware;

// expose client
export const featureFlagsClient = OpenFeature.getClient();


//TODO: create namespace for init
export const init = () => {
  sdk.start();
};
