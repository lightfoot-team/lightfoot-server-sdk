import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-proto';
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-proto';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
import { SDKConfig } from './config/config';

const samplePercentage = .5;

export const createSDK = (config: SDKConfig) => {
  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({url: `${config.metricsTracesBaseUrl}/v1/metrics`}),
    exportIntervalMillis: 5000,
  });

  return new NodeSDK({
    contextManager: new AsyncHooksContextManager().enable(),
    traceExporter: new OTLPTraceExporter({
      url: `${config.metricsTracesBaseUrl}/v1/traces`,
    }),
    metricReader: metricReader,
    sampler: new TraceIdRatioBasedSampler(samplePercentage),
    instrumentations: [getNodeAutoInstrumentations()],
  });
};
