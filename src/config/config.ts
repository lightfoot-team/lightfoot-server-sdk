interface Config {
  apiBaseUrl: string;
  metricsTracesBaseUrl: string;
}

const config: Config = {
  apiBaseUrl: "http://localhost:3001",
  metricsTracesBaseUrl: "http://localhost:4318",
  // port: Number(process.env.API_PORT) || 3000,
  // nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;