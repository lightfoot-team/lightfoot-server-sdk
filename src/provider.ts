import {
  Provider,
  ResolutionDetails,
  EvaluationContext,
  JsonValue,
  OpenFeatureEventEmitter,
} from '@openfeature/server-sdk';
import axios from 'axios';
import config from './config/config';

type DefaultValue = string | boolean | JsonValue | number
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};

const flagEvaluationCache = new WeakMap();

const getFlagEvaluationConfig = async (evaluationContext: EvaluationContext) => {
  const response = await axios.post(`${config.apiBaseUrl}/api/evaluate/config`, { context: evaluationContext }, axiosConfig);
  Object.entries(response.data).forEach((result: Record<string, any>) => {

    let configCache = new Map();
    configCache.set(result[0], result[1]);
    let cacheWithTTL = {configCache: configCache, ttl: Date.now() + 1000}
    console.log(cacheWithTTL);
    flagEvaluationCache.set(evaluationContext, cacheWithTTL);
  });
}

const getFlagEvaluation = async (flagKey: string, defaultValue: DefaultValue, context: EvaluationContext)=> {
  const flagDetails = {
    context,
    flagKey
  }
  console.log("flag eval cache:", flagEvaluationCache);
  try {
    console.log("Made it to getFlagEvaluation try block");
    if (flagEvaluationCache.has(context)) {   // has an entry for context, we assume it has flags we're looking for
      let {flagValues, ttl} = flagEvaluationCache.get(context);
      if (Date.now() > ttl) {               // if ttl expired, delete context
        flagEvaluationCache.delete(context);
        console.log("Cache invalidated!!!!!!!!");
      } else {
        let value = flagValues.get(flagKey);  // if ttl not expired, return evaluation of flag value
        let evaluation = { 
          value: value,
          reason: 'CACHED'
        }
        return evaluation;  
      }
    }
    // if flag evaluation cache doesn't have context/flags or if we've deleted context
    const response = await axios.post(`${config.apiBaseUrl}/api/evaluate`, flagDetails, axiosConfig);
    if (response === null) {
      return {
        value: defaultValue,
        reason: 'STATIC'
      }
    } 
      const result = response.data;
      let configCache = new Map();
      configCache.set(flagKey, result.value);
      let cacheWithTTL = {configCache: configCache, ttl: Date.now() + 1000};
      flagEvaluationCache.set(context, cacheWithTTL);
      console.log(cacheWithTTL);
      return result;
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
    name: 'Best Feature Provider',
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