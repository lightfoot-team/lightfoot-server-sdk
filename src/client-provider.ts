import {
  AnyProviderEvent,
  EvaluationContext,
  Hook,
  JsonValue,
  Logger,
  Provider,
  ProviderEventEmitter,
  ResolutionDetails
} from '@openfeature/web-sdk';

import axios from 'axios';

type DefaultValue = string | boolean | JsonValue | number
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};
const getFlagEvaluation = async (flagKey: string, defaultValue: DefaultValue, context: EvaluationContext) => {
  const flagDetails = {
    context,
    flagKey
  }
  try {
    const response = await axios.post('http://localhost:3001/api/evaluate', flagDetails, axiosConfig);
    if (response === null) {
      return {
        value: defaultValue,
        reason: 'STATIC'
      }
    } else {
      console.log('response:', response.data)
      return response.data;
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

  // Adds runtime validation that the provider is used with the expected SDK
  public readonly runsOn = 'client';

  readonly metadata = {
    name: 'Frontend Provider',
  } as const;
  
  // Optional provider managed hooks
  hooks?: Hook[];

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


  onContextChange?(oldContext: EvaluationContext, newContext: EvaluationContext): Promise<void> {
    // reconcile the provider's cached flags, if applicable
  }

    // implement with "new OpenFeatureEventEmitter()", and use "emit()" to emit events
  events?: ProviderEventEmitter<AnyProviderEvent> | undefined;

  initialize?(context?: EvaluationContext | undefined){
    // code to initialize your provider
  }
  onClose?(){
    // code to shut down your provider
  }

}