const { context, trace } = require('@opentelemetry/api');

import {
  Hook,
  HookContext,
  EvaluationDetails,
} from '@openfeature/server-sdk';
import { FEATURE_FLAG, KEY_ATTR, PROVIDER_NAME_ATTR, VALUE_ATTR, VARIANT_ATTR, EVALUATED } from './conventions';
import { axiosConfig } from './config/config';

export class FlagEnrichmentHook implements Hook {
  async after(hookContext: HookContext, evaluationDetails: EvaluationDetails<any>) {
    const span = trace.getActiveSpan();
    let { flagKey, value, variant } = evaluationDetails;

    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    if (!variant) {
      variant = value;
    }
    if (span) {
      span.addEvent(EVALUATED, {
        [KEY_ATTR]: flagKey,
        [VALUE_ATTR]: value,
        [VARIANT_ATTR]: variant,
      })
    }
  }

  error(hookContext: HookContext, err: Error) {
    console.error('Error during flag evaluation:', err);
  }
}