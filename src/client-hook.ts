import type {Hook, HookContext, EvaluationDetails, FlagValue, Logger} from '@openfeature/server-sdk';
import { trace, context, Span, Context } from '@opentelemetry/api';
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

 
  contextMap = new WeakMap<HookContext<any>, Context>();

  before(hookContext: HookContext) {
    const activeContext = context.active();
    console.log("Setting context for before hook:", activeContext);
    this.contextMap.set(hookContext, activeContext);
  }

  after(hookContext: HookContext, evaluationDetails: EvaluationDetails<FlagValue>) {
    const currContext = this.contextMap.get(hookContext);
    console.log('Running after hook');

    if (!currContext) {
      console.log('No context found, aborting after hook');
      return;
    }


    context.with(currContext, () => {
      const parent = trace.getSpan(context.active());
      if (!parent) return;

      parent.addEvent('feature_flag.evaluated', {
        flagKey: hookContext.flagKey,
        value: String(evaluationDetails.value),
        variant: (evaluationDetails as any).variant ?? undefined,
      });

      parent.setAttribute(`feature_flag.${hookContext.flagKey}.value`, String(evaluationDetails.value));
      if ((evaluationDetails as any).variant) {
        parent.setAttribute(`feature_flag.${hookContext.flagKey}.variant`, String((evaluationDetails as any).variant));
      }
    });
  }

  error(_: HookContext, err: Error) {
    trace.getActiveSpan()?.recordException(err);
  }
}
