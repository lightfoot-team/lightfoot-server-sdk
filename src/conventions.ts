export type EvaluationAttributes = { [key: `${typeof FEATURE_FLAG}.${string}`]: string | undefined };

export const FEATURE_FLAG = 'feature_flag';
export const KEY_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.key`;
export const PROVIDER_NAME_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.provider_name`;
export const VARIANT_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.variant`;
export const VALUE_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.value`;
export const EVALUATED = `${FEATURE_FLAG}.evaluated`;

export enum Reason {
  STATIC = 'STATIC',
  DEFAULT = 'DEFAULT',
  TARGETING_MATCH = 'TARGETING_MATCH',
  SPLIT = 'SPLIT',
  CACHED = 'CACHED',
  DISABLED = 'DISABLED',
  UNKNOWN = 'UNKNOWN',
  STALE = 'STALE',
  ERROR = 'ERROR',
  PERCENTAGE_ROLLOUT_EVERYONE = 'PERCENTAGE_ROLLOUT_EVERYONE',
  TARGETING_AND_PERCENTAGE_ROLLOUT = 'TARGETING_AND_PERCENTAGE_ROLLOUT',
}
