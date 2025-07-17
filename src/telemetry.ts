import { NodeSDK } from '@opentelemetry/sdk-node';
// import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { metrics, context, trace } from '@opentelemetry/api';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { Request, Response, NextFunction } from 'express';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-proto'
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-proto'
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
// import {
//   ATTR_SERVICE_NAME,
//   ATTR_SERVICE_VERSION,
// } from '@opentelemetry/semantic-conventions';
// const resource = defaultResource().merge(
//   resourceFromAttributes({
//     [ATTR_SERVICE_NAME]: 'dice-server',
//     [ATTR_SERVICE_VERSION]: '0.1.0',
//   }),
// );

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter(),
  exportIntervalMillis: 5000,
});
const myMeter = metrics.getMeter(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);
export const sdk = new NodeSDK({
  contextManager: new AsyncHooksContextManager().enable(),
  // traceExporter: new ConsoleSpanExporter(),
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces"
  }),
  metricReader: metricReader,
  
  instrumentations: [getNodeAutoInstrumentations()],
});

// eslint-disable-next-line max-len
export const telemetryMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tracer = trace.getTracer('my-app');

  //TODO: tracer.startActiveSpan? See OTEL instrumentation docs
  const span = tracer.startSpan('http_request', {
    attributes: {
      'http.method': req.method,
      'http.url': req.url,
    },
  });

  // Run the rest of the request handling inside this context:
  context.with(trace.setSpan(context.active(), span), () => {
    res.on('finish', () => {
      span.setAttribute('http.status_code', res.statusCode);
      span.end();
    });
    next();
  });
};
