// Helpers for various tasks

// Depndencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const _data = require('./data');

// Container for all the helpers
let helpers = {};

// Create a SHA-256 hash
helpers.hash = (str)=>{
  if(typeof(str) == 'string' && str.length > 0){
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all casses without throwing an error
helpers.parseJsonToObject = (str)=>{
  try{
    let obj = JSON.parse(str);
    return obj;
  }catch(e){
    return {};
  }
}

// Create a string of random alpha numeric characters of a given length
helpers.createRandomString  = (strLength)=>{
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for(let i = 1; i <= strLength; i++){
      // Get a random character from the possible characters string
      let randomCharacter =  possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

      // Append this character to the final string
      str += randomCharacter;

    }
    // Return the final string
    return str;

  } else {
    return false;
  }
};


// Payment request by stripe API
helpers.stripe = (amount, currency, description, source, callback)=>{
  console.log('Stripe API Called');
  // Configure the request payload
  let reqPayload = {
    'amount': amount,
    'currency': currency,
    'description': description,
    'source': source
  };

  // Stringify the payload as a query string
  let stringPayload = querystring.stringify(reqPayload);

  // Configure the request details
  let requestDetails = {
    'protocol': 'https:',
    'hostname': 'api.stripe.com',
    'method': 'POST',
    'auth': config.stripe.secret,
    'path': '/v1/charges',
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload)
    }
  };

  // Instantiate the request object
  let req = https.request(requestDetails, (res)=>{

    // Grab the status of the sent request
    let status = res.statusCode;
    // Callback successfully if the request went through
    if(status == 200 || status == 201) {
      console.log('Stripe Was Successful');
      callback(false);
    } else{
      console.log('Stripe Was Not Successful', status);
      callback('Status code returned was ' + status);
    }
  });

  // Bind to the error event so it doesn't get the thrown
  req.on('error', (e)=>{
    callback('There Was An Error');
  });

  // Add the payload
  req.write(stringPayload);

  // End the request
  req.end();
};

// Mailgun API request
helpers.mailgun = (to, subject, text, callback)=>{
  // Configure the request payload
  let reqPayload = {
    from: config.mailgun.from,
    to: 'rashidharmand@gmail.com', // 'to' would go here but I put my email address for testing purposes
    subject: subject,
    text: text
  };
  
  // Stringify the payload
  let stringPayload = querystring.stringify(reqPayload);

  // Configure the request details
  let requestDetails = {
    auth: 'api:' + config.mailgun.apiKey,
    protocol: 'https:',
    hostname: 'api.mailgun.net',
    method: 'POST',
    path: '/v3/' + config.mailgun.domainName + '/messages',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
    }
  };

  // Instantiate the request object
  let req = https.request(requestDetails, (res)=>{
    // Grab the status of the sent request
    let status = res.statusCode;

    if (status == 200 || status == 201) {
      console.log('Mailgun was Successful');
      callback(false);
    } else {
      console.log('Mailgun Was Not Successful');
      callback('Status code was ' + status);
    }
  });

  // Bind to the error event so it doesn't get thrown
  req.on('error', (e)=>{
    callback(e);
  });

  // Add the payload
  req.write(stringPayload);

  // End the request
  req.end();
};

// Export the module
module.exports = helpers;