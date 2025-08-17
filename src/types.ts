import { JsonValue } from "@openfeature/server-sdk";

export type FlagType = 'boolean' | 'string' | 'number' | 'object';
export type DefaultValue = string | boolean | JsonValue | number;
export type FlagValue = DefaultValue;

export interface EvaluationResult { value: DefaultValue; variant: string; reason: string };
export type EvaluationResultEntry = Array<string | EvaluationResult>


export interface Variant {
  [key: string]: FlagValue;
}

export interface Flag {
  flagKey: string;
  flagType: FlagType;
  variants: Variant;
  createdAt: string;
  updatedAt: null | string;
  defaultVariant: string;
  isEnabled: boolean;
}