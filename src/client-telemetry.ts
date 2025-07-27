import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ZoneContextManager } from "@opentelemetry/context-zone"; // Allows Context management, limited with async and has performance overhead
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { WebVitalsInstrumentation } from "@honeycombio/opentelemetry-web";
const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'client',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const FrontendTracer = async () => {
//   const exporter = new OTLPTraceExporter({
//   url: "http://localhost:4318/v1/traces"
// });
  const exporter = new ConsoleSpanExporter();
  const processor = new BatchSpanProcessor(exporter);

  const provider = new WebTracerProvider({
    resource: resource,
    spanProcessors: [processor]
  });

  provider.register({ contextManager: new ZoneContextManager() });

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          enabled: false, //example of disabling, delete this
          propagateTraceHeaderCorsUrls: [
            // Array of Regex to match the backend urls where API calls are going
          ]
        },
        '@opentelemetry/instrumentation-xml-http-request': {
          propagateTraceHeaderCorsUrls: [
            // Array of Regex to match the backend urls where API calls are going
            // Allows context propagation 
          ]
        }
      }),
      new WebVitalsInstrumentation()
    ]
  });
};
export default FrontendTracer;