import {
  Provider,
  ResolutionDetails,
  EvaluationContext,
  JsonValue,
  OpenFeatureEventEmitter,
  ErrorCode,
} from '@openfeature/server-sdk';
import axios from 'axios';
import { SDKConfig, axiosConfig } from './config/config';
import { Reason } from './conventions';
import { Flag, FlagValue, DefaultValue, EvaluationResultEntry } from './types';



/** Cache of flag evaluations for each evaluation context */
const flagEvaluationCache = new Map();

/** The maximum time to live for a cached set of evalutions */
const TTL = 180000;
/**
 * Finds the corresponding variant name for a flag that was evaluated with
 * a fallback value 
 * @param flag the flag being evaluated
 * @param value the value for which to lookup the variant name
 * @returns the name of the variant matching the provided value, or undefined if no match is found 
 */
const resolveVariantFromValue = (flag: Flag, value: FlagValue) => {
  let matchingVariant;
  matchingVariant = Object.keys(flag.variants).find(variant => {
    return flag.variants[variant] === value;
  })
  return matchingVariant;
}
/**
 * Adds evaluation results for a group of flags to the cache for the given context
 * @param evaluations array of evaluation results to add to the cache
 * @param serializedContext the serialized context to be used as the key in the cache
 */
const addFlagEvaluationsToCache = (evaluations: Array<EvaluationResultEntry>, serializedContext: string) => {
  const currentContextEvaluations = new Map();
  evaluations.forEach(evaluation => {
    const flagKey = evaluation[0];
    const evaluationResult = evaluation[1]
    currentContextEvaluations.set(flagKey, evaluationResult);
  })
  const evaluationsWithTTL = { evaluations: currentContextEvaluations, ttl: Date.now() + TTL };
  flagEvaluationCache.set(serializedContext, evaluationsWithTTL);
}

/**
 * Fetches evaluations for all flags within a given context and adds them to a cache
 * for future retrieval 
 * @param evaluationContext the context for which to fetch evaluations 
 * @param config the SDK configuration containing API URLs
 */
const getFlagEvaluationConfig = async (evaluationContext: EvaluationContext, config: SDKConfig) => {
  const response = await axios.post(`${config.apiBaseUrl}/api/evaluate/config`, { context: evaluationContext }, axiosConfig);
  const serializedContext = JSON.stringify(evaluationContext);
  addFlagEvaluationsToCache(Object.entries(response.data), serializedContext);
}

/**
 * Evaluates whether a cached item has expired and should be invalidated
 * @param ttl the ttl timestamp at which the cache should be invalidated
 * @returns true if the cached item has expired, else false
 */
const isExpired = (ttl: number) => {
  const result = Date.now() > ttl;
  return result;
}

/**
 * Evaluates a flag for a given evaluation context.
 * Retrieves the evalution from the cached evaluation if present, fetching a fresh evaluation 
 * from the API if the context is not in the cache or has been invalidated.
 * @param flagKey the flag to evaluate
 * @param defaultValue the fallback value if the flag cannot be evaluated
 * @param context the context to use for evaluating the flag
 * @param config the SDK configuration containing API URLs
 * @returns an `EvaluationResult` object containing the result of the evaluation
 */
const getFlagEvaluation = async (flagKey: string, defaultValue: DefaultValue, context: EvaluationContext, config: SDKConfig) => {
  const serializedContext = JSON.stringify(context);
  try {
    if (flagEvaluationCache.has(serializedContext)) {
      const { evaluations, ttl } = flagEvaluationCache.get(serializedContext);
      if (isExpired(ttl)) {
        flagEvaluationCache.delete(serializedContext);
      }
      else {
        let flagEvaluation = evaluations.get(flagKey);
        if (flagEvaluation) {
          return {
            value: flagEvaluation.value,
            reason: Reason.CACHED,
            variant: flagEvaluation.variant,
          }
        }
        return {
          value: defaultValue,
          variant: undefined,
          reason: Reason.ERROR,
        }

      }
    }
    await getFlagEvaluationConfig(context, config);
    const evaluations = flagEvaluationCache.get(serializedContext).evaluations;
    const flagEvaluation = evaluations.get(flagKey);
    return {
      value: flagEvaluation.value,
      variant: flagEvaluation.variant,
      reason: flagEvaluation.reason
    }
  } catch (err) {
    console.error(err)

    return {
      value: defaultValue,
      variant: undefined,
      reason: Reason.ERROR,
    }
  }
}

export class LightFootServerProvider implements Provider {
  readonly metadata = {
    name: 'LightFoot Server Provider',
  } as const;

  readonly runsOn = 'server';

  events = new OpenFeatureEventEmitter();

  constructor(private config: SDKConfig) { }

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<boolean>> {

    const resolutionDetails = await getFlagEvaluation(flagKey, defaultValue, context, this.config);
    console.log('details', resolutionDetails)
    return resolutionDetails;
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<string>> {
    const resolutionDetails = await getFlagEvaluation(flagKey, defaultValue, context, this.config);
    return resolutionDetails;
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<number>> {
    const resolutionDetails = await getFlagEvaluation(flagKey, defaultValue, context, this.config);
    return resolutionDetails;
  }

  async resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<T>> {
    const resolutionDetails = await getFlagEvaluation(flagKey, defaultValue, context, this.config);
    return resolutionDetails;
  }
}