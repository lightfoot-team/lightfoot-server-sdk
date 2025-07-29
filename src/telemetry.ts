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
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

//TODO: find out where/how metric export to collector is configured (automatic?)
const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({url: 'http://localhost:4318/v1/metrics'}),
  exportIntervalMillis: 5000,
});

const samplePercentage = .5;

export const sdk = new NodeSDK({
  contextManager: new AsyncHooksContextManager().enable(),
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces" //TODO: refactor hard code
  }),
  metricReader: metricReader,
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
  
  instrumentations: [getNodeAutoInstrumentations()],
});

// Note: We aren't using telemetryMiddleware anywhere anymore. 
//  It was removed from toy app and from elsewhere in SDK. 
//  But if you comment it out, line 54 raises some errors.
//    -SV
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
