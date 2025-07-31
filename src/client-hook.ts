import type {Hook, HookContext, EvaluationDetails, FlagValue, Logger} from '@openfeature/server-sdk';
import { trace, context, Span } from '@opentelemetry/api';
import { FEATURE_FLAG, KEY_ATTR, PROVIDER_NAME_ATTR, VARIANT_ATTR } from './client-conventions';
import type { OpenTelemetryHookOptions } from './client-otel-hook';
import { OpenTelemetryHook } from './client-otel-hook';
export type TracingHookOptions = OpenTelemetryHookOptions;

/**
 * A hook that adds conventionally-compliant span events to feature flag evaluations.
 *
 * See {@link https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/feature-flags/}
 */
export class TracingHook extends OpenTelemetryHook implements Hook {
  protected name = TracingHook.name;

  constructor(options?: TracingHookOptions, logger?: Logger) {
    super(options, logger);
  }

  spanMap = new WeakMap<HookContext<any>, Span>();

  before(hookContext: HookContext) {
    // Start a span before the flag evaluation
    const span = trace.getTracer('test-tracer').startSpan(`evaluate-flag:${hookContext.flagKey}`);

    // Store span on the hook context so we can retrieve it later
    this.spanMap.set(hookContext, span);
  }
  after(hookContext: HookContext, evaluationDetails: EvaluationDetails<FlagValue>) {
    console.log('Running hook')
    const span = this.spanMap.get(hookContext);
    console.log('Span', span)


    if (span) {
      console.log('Value', evaluationDetails.value)
      let variant = evaluationDetails.variant;
      console.log('Variant', variant)
      if (!variant) {
        if (typeof evaluationDetails.value === 'string') {
          variant = evaluationDetails.value;
        } else {
          variant = JSON.stringify(evaluationDetails.value);
        }
      }

      span.addEvent(FEATURE_FLAG, {
        [KEY_ATTR]: hookContext.flagKey,
        [PROVIDER_NAME_ATTR]: hookContext.providerMetadata.name,
        [VARIANT_ATTR]: variant,
        ...this.safeAttributeMapper(evaluationDetails.flagMetadata),
      });
    }
  }

  error(_: HookContext, err: Error) {
    trace.getActiveSpan()?.recordException(err);
  }
}
