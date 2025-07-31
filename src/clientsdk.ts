import FrontendTracer from "./client-telemetry";
import { ClientFeatureProvider } from "./client-provider";
import { OpenFeature } from "@openfeature/web-sdk";
// import { TracingHook } from "@openfeature/open-telemetry-hooks";
import { TracingHook } from './client-hook'

// // set up provider TODO: move within LFCSDK scope? 
const clientFeatureFlagProvider = new ClientFeatureProvider();

OpenFeature.setProvider(clientFeatureFlagProvider);


// try {
//   await OpenFeature.setProviderAndWait(new ClientFeatureProvider());
// } catch (error) {
//   console.error('Failed to initialize provider:', error);
// }



// expose client
export const clientFeatureFlagsClient = OpenFeature.getClient();

// expose async func to start the SDK
export const LightFootClientSDK = {
  init: () => {
    clientFeatureFlagProvider.initialize()
    clientFeatureFlagsClient.addHooks(new TracingHook());
    FrontendTracer();
    console.log('Client', clientFeatureFlagsClient)
  }
};
