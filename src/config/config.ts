export interface SDKConfig {
  flagEvaluationURL: string;
  OTLPExporterBaseURL: string;
}

export const defaultConfig: SDKConfig = {
  flagEvaluationURL: "http://localhost:3001",
  OTLPExporterBaseURL: "http://localhost:4318",
};

export const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};