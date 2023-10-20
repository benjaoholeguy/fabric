// curl -k https://localhost:8000/
// const https = require('node:https');
// const fs = require('node:fs');
const path = require('path');
const config = require('./config');
const url = require('url');
// const StringDecoder = require('string_decoder').StringDecoder;
// const handlers = require('./handlers');
const helpers = require ('./helpers');
const util = require('util');
const debug = util.debuglog('server');


const http = require('http');
 
const hostname = '127.0.0.1';
const port = 5001;
 
// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'application/json');

//   const aux = {"product_id":"01HD0KQYP2V37MXZNF1XJMY46X","supplier_id":"01HD0KQYP23MZZBXQN6C2KR0RV","part_name":"exhaust manifold","shipment_date":"2023-12-05T10:32:23Z","shipment_method_type":"Plane","part_location":{"longitude":"-69.0393069","latitude":"10.1197024"},"apprisedValue":"25.27","shipment_date_str": "2024-10-28","shipment_date_str": "2024-01-01"};

//   // const aux = '{"product_id":"01HD5X85RB2SGC3HMBDSA2XR2A","shipment_date":"2024-03-20T16:57:10Z","shipment_date_str": "2024-10-28"}';
//   // let payloadString = JSON.parse(aux);
//   res.end(JSON.stringify(aux));
// });
 
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });


// Instantiate the server module object
const server = {};

server.httpServer = http.createServer((req, res) => {

  res.writeHead(200);
  // res.end('hello world\n');
});

// All the server logic for both the http and https servers
server.unifiedServer = (req,res)=>{
      // Convert the payload to a string
     //   const aux = {"product_id":"01HD0KQYP2V37MXZNF1XJMY46X","supplier_id":"01HD0KQYP23MZZBXQN6C2KR0RV","part_name":"exhaust manifold","shipment_date":"2023-12-05T10:32:23Z","shipment_method_type":"Plane","part_location":{"longitude":"-69.0393069","latitude":"10.1197024"},"apprisedValue":"25.27","shipment_date_str": "2024-10-28","shipment_date_str": "2024-01-01"};
      let payload = {"product_id":"01HD0KQYP2V37MXZNF1XJMY46X","supplier_id":"01HD0KQYP23MZZBXQN6C2KR0RV","part_name":"exhaust manifold","shipment_date":"2023-12-05T10:32:23Z","shipment_method_type":"Plane","part_location":{"longitude":"-69.0393069","latitude":"10.1197024"},"apprisedValue":"25.27","shipment_date_str": "2024-10-28","shipment_date_str": "2024-01-01"};

      let payloadString = JSON.stringify(payload);
  // res.end();

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      // res.writeHead(statusCode);
      res.writeHead(200);
      res.end(payloadString);

      // If the response is 200, print green, otherwise print red
      // if(statusCode == 200){
      //   debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      // } else{
      //   debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      // }
    // }); 

  // }) 
};

// Init script
server.init = ()=>{
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, ()=>{
    // Send to console, in pink
    console.log('\x1b[35m%s\x1b[0m', `The Server Is Listening On Port ${config.httpPort}`);
  });
}

// Export the module
module.exports = server;
