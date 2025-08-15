export type EvaluationAttributes = { [key: `${typeof FEATURE_FLAG}.${string}`]: string | undefined };

export const FEATURE_FLAG = 'feature_flag';
export const KEY_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.key`;
export const PROVIDER_NAME_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.provider_name`;
export const VARIANT_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.variant`;
export const VALUE_ATTR: keyof EvaluationAttributes = `${FEATURE_FLAG}.value`;
