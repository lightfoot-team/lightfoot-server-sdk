import {
  Provider,
  ResolutionDetails,
  EvaluationContext,
  JsonValue,
  OpenFeatureEventEmitter,
} from '@openfeature/server-sdk';
import axios from 'axios';
import config from './config/config';

type DefaultValue = string | boolean | JsonValue | number;
interface EvaluationResult { value: DefaultValue; variant: string; reason: string };
type EvaluationResultEntry = Array<string | EvaluationResult>

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};

/** Cache of flag evaluations for each evaluation context */
const flagEvaluationCache = new Map();

/** The maximum time to live for a cached set of evalutions */
const TTL = 1000 * 30;

/**
 * Adds evaluation results for a group of flags to the cache for the given context
 * @param evaluations array of evaluation results to add to the cache
 * @param serializedContext the serialized context to be used as the key in the cache
 */
const addFlagEvaluationsToCache = (evaluations: Array<EvaluationResultEntry>, serializedContext: string) => {
  const flagEvaluations = new Map();
  evaluations.forEach(evaluation => {
    const flagKey = evaluation[0];
    const evaluationResult = evaluation[1]
    flagEvaluations.set(flagKey, evaluationResult);
  })
  const evaluationsWithTTL = { evaluations: flagEvaluations, ttl: Date.now() + TTL };
  flagEvaluationCache.set(serializedContext, evaluationsWithTTL);
}

/**
 * Fetches evaluations for all flags within a given context and adds them to a cache
 * for future retrieval 
 * @param evaluationContext the context for which to fetch evaluations 
 */
const getFlagEvaluationConfig = async (evaluationContext: EvaluationContext) => {
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
 * @returns an `EvaluationResult` object containing the result of the evaluation
 */
const getFlagEvaluation = async (flagKey: string, defaultValue: DefaultValue, context: EvaluationContext) => {
  const serializedContext = JSON.stringify(context)
  try {
    if (flagEvaluationCache.has(serializedContext)) {
      const { evaluations, ttl } = flagEvaluationCache.get(serializedContext);
      if (isExpired(ttl)) {           
        flagEvaluationCache.delete(serializedContext);
      }
      else {
        let value = evaluations.get(flagKey).value;
        //TODO: handle case where flag is not present in cache (throw error?)
        let evaluation = {
          value: value,
          reason: 'CACHED' //TODO: make sure this is best practice 
        }
        return evaluation;
      }
    }
    await getFlagEvaluationConfig(context);
    const evaluations = flagEvaluationCache.get(serializedContext).evaluations;
    const flagEvaluation = evaluations.get(flagKey);
    return {
      value: flagEvaluation.value,
      reason: flagEvaluation.reason
    }
  } catch (err) {
    console.error(err)
    return {
      value: defaultValue,
      reason: 'ERROR'
    }
  }
}


//TODO: look up naming conventions for provider implementations
export class MyFeatureProvider implements Provider {
  readonly metadata = {
    name: 'Lightfoot Server Provider',
  } as const;

  readonly runsOn = 'server';

  // emitter for provider events
  events = new OpenFeatureEventEmitter();

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<boolean>> {

    const resolutionDetails = await getFlagEvaluation(flagKey, defaultValue, context);
    console.log('details', resolutionDetails)
    return resolutionDetails;
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<string>> {
    const resolutionDetails = await getFlagEvaluation(flagKey, defaultValue, context);
    return resolutionDetails;
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<number>> {
    const resolutionDetails = await getFlagEvaluation(flagKey, defaultValue, context);
    return resolutionDetails;
  }

  async resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<T>> {
    const resolutionDetails = await getFlagEvaluation(flagKey, defaultValue, context);
    return resolutionDetails;
  }
}