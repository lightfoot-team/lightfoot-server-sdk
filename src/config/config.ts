export interface SDKConfig {
  apiBaseUrl: string;
  metricsTracesBaseUrl: string;
}

export const defaultConfig: SDKConfig = {
  apiBaseUrl: "http://localhost:3001",
  metricsTracesBaseUrl: "http://localhost:4318",
};
