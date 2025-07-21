import {
  Provider,
  ResolutionDetails,
  EvaluationContext,
  JsonValue,
  OpenFeatureEventEmitter,
} from '@openfeature/server-sdk';
import axios from 'axios';

type DefaultValue = string | boolean | JsonValue | number
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};
const getFlagValue = async (flagKey: string, defaultValue: DefaultValue, context: EvaluationContext)=> {
  const flagDetails = {
    context,
    flagKey
  }
  let value;
  try {
    const response = await axios.post('http://localhost:3001/api/evaluate', flagDetails, axiosConfig);
    if (response === null) {
      value = defaultValue;
    } else {
      value = response.data.value;
    }
  } catch (err) {
    console.error(err)
    value = defaultValue
  }
  return value;
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

    const value = await getFlagValue(flagKey, defaultValue, context);
    const resolutionDetails: ResolutionDetails<boolean> = {
      value
    };
    return resolutionDetails
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<string>> {
    const value = await getFlagValue(flagKey, defaultValue, context);
    const resolutionDetails: ResolutionDetails<string> = {
      value
    };
    return resolutionDetails
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<number>> {
    const value = await getFlagValue(flagKey, defaultValue, context);
    const resolutionDetails: ResolutionDetails<number> = {
      value
    };
    return resolutionDetails
  }

  async resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<T>> {
    const value = await getFlagValue(flagKey, defaultValue, context);
    const resolutionDetails: ResolutionDetails<T> = {
      value
    };
    return resolutionDetails;
  }
}