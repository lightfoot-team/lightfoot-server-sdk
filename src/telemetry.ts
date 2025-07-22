import { NodeSDK } from '@opentelemetry/sdk-node';
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

//TODO: find out where/how metric export to collector is configured (automatic?)
const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter(),
  exportIntervalMillis: 5000,
});

//TODO: is this necessary? Look up how metric collection + exporting works in Otel docs
// const myMeter = metrics.getMeter(
//   'instrumentation-scope-name',
//   'instrumentation-scope-version',
// );
export const sdk = new NodeSDK({
  contextManager: new AsyncHooksContextManager().enable(),
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces" //TODO: refactor hard code
  }),
  metricReader: metricReader,
  
  instrumentations: [getNodeAutoInstrumentations()],
});


//TODO: refactor or eliminate middleware 
//      pivot to handling errors/crashes? 
//      pivot to handling cache hits?
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
