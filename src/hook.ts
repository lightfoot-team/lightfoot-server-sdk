const { context, trace } = require('@opentelemetry/api');

import {
  Hook,
  HookContext,
  EvaluationDetails,
} from '@openfeature/server-sdk';
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};

export class FlagEnrichmentHook implements Hook {
  // eslint-disable-next-line max-len
  async after(hookContext: HookContext, evaluationDetails: EvaluationDetails<any>) {
    const activeContext = context.active();
    const span = trace.getSpan(activeContext);
    const spanContext = span.spanContext();
    const spanData = {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      traceFlags: spanContext.traceFlags,
      name: span.name,
      startTime: span.startTime,
      endTime: span.endTime,
      attributes: span.attributes,
      status: span.status,
      events: span.events,
      evaluationDetails
    };
  }

  error(hookContext: HookContext, err: Error) {
    console.error('Error during flag evaluation:', err);
  }
}