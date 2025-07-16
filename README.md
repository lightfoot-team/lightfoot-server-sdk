# How to install
In the terminal, enter `npm install @no-name/sdk`


# How to initialize
At the top level in your file
`const { featureFlagsClient, testTelemetryMiddleware, init } = require('@no-name/sdk');`

Then call init at the top level after require
`init()`

# How to use
To declare a feature flag in your code:
  Declare your flag context object and assign to a variable
  Call `getBooleanValue` on `featureFlagsClient`. 
    Pass in the feature flag name, the default boolean value, and flag context as arguments
  Assign the result to a variable
    `const featuredParkOn = await featureFlagsClient.getBooleanValue("featured-park", true, flagContext);`

  Use the variable for evaluating feature flag status in your code. 
  ```
  if (featuredParkOn) {
      // Run your feature logic here
    } else {
      // Don't run your feature logic
    }
  ```

Note: 
  Telemetry is automatically enriched and emitted from your app, using this SDK 