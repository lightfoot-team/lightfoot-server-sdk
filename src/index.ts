import { FlagEnrichmentHook } from "./hook";
import { MyFeatureProvider } from "./provider";
import { OpenFeature } from "@openfeature/server-sdk";
import { MetricsHook, TracingHook } from "@openfeature/open-telemetry-hooks";
// import { context, trace } from '@opentelemetry/api';
import { sdk } from './telemetry';

// const TEST_FLAG_CONFIG = {
//   'featured-park': {
//     variants: {
//       on: true,
//       off: false
//     },
//     disabled: false,
//     defaultVariant: "off",
//     contextEvaluator: (context) => {
//       return 'on';
//     },
//   }
// };

// setup provider
const featureFlagProvider = new MyFeatureProvider();
OpenFeature.setProvider(featureFlagProvider);

// setup hooks
OpenFeature.addHooks(new FlagEnrichmentHook());
OpenFeature.addHooks(new MetricsHook());
OpenFeature.addHooks(new TracingHook());

// expose client
export const featureFlagsClient = OpenFeature.getClient();

// expose async func to start the SDK
export const init = async () => {
  await sdk.start();
};
