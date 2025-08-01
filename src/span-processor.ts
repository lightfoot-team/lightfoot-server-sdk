import { Span, SpanKind } from '@opentelemetry/api';
import { type SpanProcessor, type ReadableSpan } from '@opentelemetry/sdk-trace-base';
import evaluatedFlags from './evaluated-cache';

export default class FeatureFlagSpanProcessor implements SpanProcessor {
  onStart(span: Span) {
    console.log('starting span...')

       evaluatedFlags.forEach((value, flagKey) => {
        console.log('Flag:', value, flagKey)
        span.addEvent('feature_flag.evaluated',{
            flagKey,
            value: String(value),
          })
        });
      
  }

  onEnd(span: ReadableSpan) {
  
  }

  async shutdown(): Promise<void> {
    // Clean up resources if needed
  }

  async forceFlush(): Promise<void> {
    // If needed, force flush spans manually
  }
}
