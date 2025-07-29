import FrontendTracer from "./client-telemetry";
import { ClientFeatureProvider } from "./client-provider";
import { OpenFeature } from "@openfeature/web-sdk";
import { TracingHook } from "@openfeature/open-telemetry-hooks";
// import { context, trace } from '@opentelemetry/api';
// import { metrics, context, trace } from '@opentelemetry/api';

// set up provider
const featureFlagProvider = new ClientFeatureProvider();
OpenFeature.setProvider(featureFlagProvider);

// expose client
export const featureFlagsClient = OpenFeature.getClient();

// expose async func to start the SDK
export const lightFoot = {
  init: () => {
  FrontendTracer();
  featureFlagsClient.addHooks(new TracingHook());
  }
};
