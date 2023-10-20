// Create and export configuration variables

// Dependencies
// let private = require('../private');

// Container for all the environments
let environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 4000,
  'httpsPort' : 4001,
  'envName' : 'staging',
  'hashingSecret' : 'thisIsASecret',
  // 'stripe' : {
  //   'publishable' : private.stripe.publishable,
  //   'secret' : private.stripe.secret
  // },
  // 'mailgun' :{
  //   'domainName' : private.mailgun.domainName,
  //   'apiKey' : private.mailgun.apiKey,
  //   'from' : private.mailgun.from
  // }
};

// Production environment
// environments.production = {
//   'httpPort' : 5000,
//   'httpsPort' : 5001,
//   'envName' : 'production',
//   'hashingSecret' : 'thisIsAlsoASecret',
//   // 'stripe' : {
//   //   'publishable' : private.stripe.publishable,
//   //   'secret' : private.stripe.secret
//   // },
//   // 'mailgun' :{
//   //   'domainName' : private.mailgun.domainName,
//   //   'apiKey' : private.mailgun.apiKey,
//   //   'from' : private.mailgun.from
//   // }
// };

// Define which environment was passed as a command line argument
// let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that current environment exists in the environments object. If not, default to staging environment
// let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

let environmentToExport = environments.staging;

// Export the module
module.exports = environmentToExport;
