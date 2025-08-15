const { context, trace } = require('@opentelemetry/api');

import {
  Hook,
  HookContext,
  EvaluationDetails,
} from '@openfeature/server-sdk';
import { FEATURE_FLAG, KEY_ATTR, PROVIDER_NAME_ATTR, VALUE_ATTR, VARIANT_ATTR } from './conventions';
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
    let { flagKey, value, variant } = evaluationDetails;

    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    if (!variant) {
      variant = value;
    }
    span.addEvent(`${FEATURE_FLAG}.evaluated`, {
      [KEY_ATTR]: flagKey,
      [VALUE_ATTR]: value,
      [VARIANT_ATTR]: variant,
    })
  }

  error(hookContext: HookContext, err: Error) {
    console.error('Error during flag evaluation:', err);
  }
}