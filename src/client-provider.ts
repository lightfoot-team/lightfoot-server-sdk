//import { OpenFeatureEventEmitter } from '@openfeature/js-sdk';
import {
  AnyProviderEvent,
  ClientProviderEvents,
  EvaluationContext,
  Hook,
  JsonValue,
  Logger,
  Provider,
  ProviderEventEmitter,
  ResolutionDetails,
} from '@openfeature/web-sdk';

import axios from 'axios';

type DefaultValue = string | boolean | JsonValue | number
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};


const cache = new Map();

/** 
 * Retrieves the evaluation results for the current context to enable 
 * static evaluation of feature flags 
 * @param evaluationContext the context for static flag evaluation
 */
const getFlagEvaluationConfig = async (evaluationContext: EvaluationContext) => {
  //TODO: For now, fetch evaluation for all flags for the given context 
  const response = await axios.post('http://localhost:3001/api/evaluate/config', {context: evaluationContext}, axiosConfig);
  // Set the flag evaluation result for each flag
  response.data.forEach((result: Record<string, any>) => {
    cache.set(result.flagKey, result.evaluationResult);
  });
  
}
// curl -X POST http://localhost:3001/api/evaluate/config \
//   -H "Content-Type: application/json" \
//   -d '{
//     "context": {
//       "name": "admin",
//       "username": "admin"
//     }
//   }'
const getFlagEvaluation = (flagKey: string, defaultValue: DefaultValue, context: EvaluationContext) => {
    if (!cache.has(flagKey)) {
      return { // Default if flag is not in cache? 
        value: defaultValue,
        reason: 'STATIC'
      }
    } else {
      return cache.get(flagKey)
    }
  
}

//TODO: look up naming conventions for provider implementations
export class ClientFeatureProvider implements Provider {

  // Adds runtime validation that the provider is used with the expected SDK
  public readonly runsOn = 'client';

  readonly metadata = {
    name: 'Frontend Provider',
  } as const;

  // Optional provider managed hooks
  hooks: Hook[] = [];

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<boolean> {

    const resolutionDetails =  getFlagEvaluation(flagKey, defaultValue, context);
    return resolutionDetails;
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<string> {
    const resolutionDetails =  getFlagEvaluation(flagKey, defaultValue, context);
    return resolutionDetails;
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<number> {
    const resolutionDetails =  getFlagEvaluation(flagKey, defaultValue, context);
    return resolutionDetails;
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<T> {
    const resolutionDetails =  getFlagEvaluation(flagKey, defaultValue, context);
    return resolutionDetails;
  }


  async onContextChange?(oldContext: EvaluationContext, newContext: EvaluationContext): Promise<void> {
    // reconcile the provider's cached flags, if applicable
    await getFlagEvaluationConfig
  }

  
    // implement with "new OpenFeatureEventEmitter()", and use "emit()" to emit events
//events: ProviderEventEmitter<AnyProviderEvent> = new OpenFeatureEventEmitter() as unknown as ProviderEventEmitter<AnyProviderEvent>;

  // events = ProviderEventEmitter<AnyProviderEvent> = new OpenFeatureEventEmitter();


  async initialize(context?: EvaluationContext | undefined){
    // code to initialize your provider
    await getFlagEvaluationConfig
  }
  // onClose?(){
  //   // code to shut down your provider
  // }

}