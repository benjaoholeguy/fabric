const http = require('http');
const url = require('url');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = require('./lib/handlers');
const fs = require('fs');
const _data = require('./lib/data');
const helpers = require('./lib/helpers');

// _data.create('products','newFile',{'foo':'bar'},function(err){
//   console.log('this was the err ', err)
// })

// Instantiate the server module object
const server = http.createServer((req, res) => {
  let parsedURL = url.parse(req.url,true);
  // Get the path from URL
  let path = parsedURL.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g,'');
  

  // Get the HTTP Method
  let method = req.method.toLowerCase();

  // get the query string as an object
  // let queryStringObject = url.parse(path).query;
  // const parsedQuery = querystring.parse(queryStringObject);

  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;

  // Get the Headers as an object
  let headers = req.headers;

  // get the payload, if any
  let decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data)=>{
    buffer += decoder.write(data);
  });
  req.on('end', ()=>{
    buffer += decoder.end();

    // chose the handler this request should go to
    let chosenHandler = server.router[trimmedPath] || handlers.notFound;

    // construct the data object
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : query,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buffer)
    };

    // Route the request specified in the router
    chosenHandler(data,function(statusCode,payload){

      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      payload = typeof(payload) == 'object' ? payload : {};

      let payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log(`Request this response: `, statusCode, payloadString);

    });

    const aux = {"product_id":"01HD0KQYP2V37MXZNF1XJMY46X","supplier_id":"01HD0KQYP23MZZBXQN6C2KR0RV","part_name":"exhaust manifold","shipment_date":"2023-12-05T10:32:23Z","shipment_method_type":"Plane","part_location":{"longitude":"-69.0393069","latitude":"10.1197024"},"apprisedValue":"25.27","shipment_date_str": "2024-10-28","shipment_date_str": "2024-01-01"};

  


  })


  });
 
server.listen(port="4001", hostname="127.0.0.1", () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// 


// Defining a Request Router
server.router = {
    'oracle': handlers.products,
}


// const http = require('http');
 
// const hostname = '127.0.0.1';
// const port = 5001;
 
// // const server = http.createServer((req, res) => {
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
