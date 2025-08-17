export type EvaluationAttributes = { [key: `${typeof FEATURE_FLAG}.${string}`]: string | undefined };

export const FEATURE_FLAG = 'feature_flag';
export const KEY_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.key`;
export const PROVIDER_NAME_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.provider_name`;
export const VARIANT_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.variant`;
export const VALUE_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.value`;
export const EVALUATED = `${FEATURE_FLAG}.evaluated`;
//Reasons
const PERCENTAGE_ROLLOUT_EVERYONE = 'PERCENTAGE_ROLLOUT_EVERYONE';
const TARGETING_AND_PERCENTAGE_ROLLOUT = 'TARGETING_AND_PERCENTAGE_ROLLOUT';
const STATIC = 'STATIC';
const DEFAULT = 'DEFAULT';
const TARGETING_MATCH = 'TARGETING_MATCH';
const SPLIT = 'SPLIT';
const CACHED = 'CACHED';
const DISABLED = 'DISABLED';
const UNKNOWN = 'UNKNOWN';
const STALE = 'STALE';
const ERROR = 'ERROR';

export enum Reason {
  STATIC,
  DEFAULT,
  TARGETING_MATCH,
  SPLIT,
  CACHED,
  DISABLED,
  UNKNOWN,
  STALE,
  ERROR,
  PERCENTAGE_ROLLOUT_EVERYONE,
  TARGETING_AND_PERCENTAGE_ROLLOUT,
}
