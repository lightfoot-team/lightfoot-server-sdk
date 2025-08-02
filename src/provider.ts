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
    flagEvaluationCache.set(evaluationContext, configCache)
  });
}

const getFlagEvaluation = async (flagKey: string, defaultValue: DefaultValue, context: EvaluationContext)=> {
  const flagDetails = {
    context,
    flagKey
  }
  try {
    console.log("Made it to getFlagEvaluation try block");
    if (flagEvaluationCache.has(context)) {
      let flagValues = flagEvaluationCache.get(context);
      let value = flagValues.get(flagKey);
      let evaluation = { 
        value: value,
        reason: 'CACHED'
      }

      return evaluation;  
    }
    
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
      flagEvaluationCache.set(context, configCache);
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