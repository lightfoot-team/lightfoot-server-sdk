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
const getFlagEvaluation = async (flagKey: string, defaultValue: DefaultValue, context: EvaluationContext)=> {
  const flagDetails = {
    context,
    flagKey
  }
  try {
    const response = await axios.post(`${config.apiBaseUrl}/api/evaluate`, flagDetails, axiosConfig);
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