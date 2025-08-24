# Lightfoot Server SDK
A comprehensive server SDK for Lightfoot with integrated OpenTelemetry instrumentation and feature flag management.

# Installation
```bash
npm install lightfoot-server-sdk
```

# Quick Start
```javascript
const { LightFootSDK } = require('lightfoot-server-sdk');

// Initialize the SDK
const lightFoot = new LightFootSDK({
  flagEvaluationURL: "http://localhost:3001",
  OTLPExporterBaseUrl: "http://localhost:4318"
});

// Initialize telemetry and feature flags
lightFoot.init();

// Get the OpenFeature client for feature flag evaluation
const featureFlagsClient = lightFoot.getClient();
```

# Features
- **OpenTelemetry Integration** - Automatic instrumentation for traces, metrics, and logs
- **Feature Flag Management** - Built-in OpenFeature support for feature flags
- **Easy Configuration** - Simple setup 

# Configuration
## Local Configuration 
```javascript
const { LightFootSDK } = require('lightfoot-server-sdk');

const lightFoot = new LightFootSDK({
  flagEvaluationURL: "http://localhost:3001",   // Your Lightfoot flag evaluation API endpoint
  OTLPExporterBaseUrl: "http://localhost:4318"  // OpenTelemetry collector endpoint
});
```

## Deployment Configuration
```javascript
const lightFoot = new LightFootSDK({
  flagEvaluationURL: "https://api.your-lightfoot-instance.com",
  OTLPExporterBaseUrl: "https://otel-collector.your-domain.com"
});
```

# Usage Example
```javascript
const { LightFootSDK } = require('lightfoot-server-sdk');

const lightFoot = new LightFootSDK({
  flagEvaluationURL: "http://localhost:3001",
  OTLPExporterBaseUrl: "http://localhost:4318"
});

lightFoot.init();
const featureFlagsClient = lightFoot.getClient();

function getUserContext(req) {
  const userId = req.get('x-user-id');
  return {
    targetingKey: userId,
    kind: 'user',
    user: {
      id: userId,
      role: req.get('x-user-role') || '',
      group: req.get('x-user-group') || '',
    }
  };
}

router.get("/", (async(req, _)) => {
  const context = getUserContext(req);
  const newFeature = featureFlagsClient.getBooleanValue("new-feature", false, context);

  if (newFeature) {
    // execute code with new feature
  } else {
    // execute code without new feature
  }
});
```

# Methods Available on Feature Flag Client
- `getBooleanValue(flagKey: string, defaultValue: boolean, context?: EvaluationContext): boolean`
- `getStringValue(flagKey: string, defaultValue: string, context?: EvaluationContext): string`
- `getNumberValue(flagKey: string, defaultValue: number, context?: EvaluationContext): number`
- `getObjectValue(flagKey: string, defaultValue: object, context?: EvaluationContext): object`

# Requirements
- Node.js 16.0.0 or higher
- TypeScript 4.5+ (if using TypeScript)
