// Request Handlers

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');


// Define the Handlers
let handlers = {};

// Oracle
handlers.products = (data,callback)=>{
  let acceptableMethods = ['post', 'get', 'put', 'patch', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._products[data.method](data, callback);
  } else{
    callback(405);
  }
}

// Container for the oracle submethods
handlers._products = {};




// Oracle - POST
// Required data: product_id, supplier_id, part_name, shipment_date, expected_shipment_date, shipment_method_type, longitude, latitude, quantity, appraisedValue
// Optional data: none
handlers._products.post = (data, callback)=>{
  // Check that all required fields are filled out
  let product_id = typeof(data.payload.product_id) == 'string' && data.payload.product_id.trim().length > 0 ? data.payload.product_id.trim() : false;
  let supplier_id = typeof(data.payload.supplier_id) == 'string' && data.payload.supplier_id.trim().length > 0 ? data.payload.supplier_id.trim() : false;
  let part_name = typeof(data.payload.part_name) == 'string' && data.payload.part_name.trim().length > 0 ? data.payload.part_name.trim() : false;
  let shipment_date = typeof(data.payload.shipment_date) == 'string' && data.payload.shipment_date.trim().length > 0 ? data.payload.shipment_date.trim() : false;
  let expected_shipment_date = typeof(data.payload.expected_shipment_date) == 'string' && data.payload.expected_shipment_date.trim().length > 0 ? data.payload.expected_shipment_date.trim() : false;
  let shipment_method_type = typeof(data.payload.shipment_method_type) == 'string' && data.payload.shipment_method_type.trim().length > 0 ? data.payload.shipment_method_type.trim() : false;
  let longitude = typeof(data.payload.longitude) == 'string' && data.payload.longitude.trim().length > 0 ? data.payload.longitude.trim() : false;
  let latitude = typeof(data.payload.latitude) == 'string' && data.payload.latitude.trim().length > 0 ? data.payload.latitude.trim() : false;
  let quantity = typeof(data.payload.quantity) == 'string' && data.payload.quantity.trim().length > 0 ? data.payload.quantity.trim() : false;
  let appraisedValue = typeof(data.payload.appraisedValue) == 'string' && data.payload.appraisedValue.trim().length > 0 ? data.payload.appraisedValue.trim() : false;

  if(product_id && supplier_id && part_name && expected_shipment_date && appraisedValue){
    // Make sure oracle doesn't already exist
    _data.read('products', product_id, (err, data)=>{
      if(err){
       
        // Create the product object
        
        let productObject = {
          'product_id' : product_id,
          'supplier_id' : supplier_id,
          'part_name' : part_name,
          'shipment_date' : shipment_date,
          'expected_shipment_date' : expected_shipment_date,
          'shipment_method_type': shipment_method_type,
          'longitude' : longitude,
          'latitude' : latitude,
          'quantity' : quantity,
          'quantity' : quantity,
          'appraisedValue': appraisedValue
        }

        // Store the user
        _data.create('products', product_id, productObject, (err)=>{
          if(!err){
            callback(200);
          } else {
            console.log(err);
            callback(500, {'Error' : 'Could not create the new product'});
          }
        })
        
        
      } else {
        // User Already Exists
        callback(400, {'Error' : ' A user with that phone number already exists'});
      }
    })
  } else {
    callback(400, {'Error' : 'Missing Required Fields'});
  }
};

// Oracle - GET
// Required data: product_id
// Optional data: none
handlers._products.get = (data, callback)=>{
  // Check that email provided is valid
  let product_id = typeof(data.queryStringObject.product_id) == 'string' && data.queryStringObject.product_id.trim().length > 0 ? data.queryStringObject.product_id.trim() : false;
  if(product_id) {
   

    // Verify that given token from headers is valid for the email
         // Lookup the user
        _data.read('products', product_id, (err, data)=>{
          if(!err && data){
            // Remove the hashed password from the user object before returning it to the requestor
            callback(200, data);
          } else {
            callback(404);
          }
        });
     
  } else {
    callback(400, {'Error' : 'Missing required field'})
  }

};

// Products - PUT
// Required data: email
// Optional data: firstName, lastName, password, streetAddress, city, state, zipCode (at least one must be specified)
handlers._products.put = (data, callback)=>{
  // Check for the required field
  let product_id = typeof(data.payload.product_id) == 'string' && data.payload.product_id.trim().length > 0 ? data.payload.product_id.trim() : false;

  // Check for optional fields
  let shipment_date = typeof(data.payload.shipment_date) == 'string' && data.payload.shipment_date.trim().length > 0 ? data.payload.shipment_date.trim() : false;
  let longitude = typeof(data.payload.longitude) == 'string' && data.payload.longitude.trim().length > 0 ? data.payload.longitude.trim() : false;
  let latitude = typeof(data.payload.latitude) == 'string' && data.payload.latitude.trim().length > 0 ? data.payload.latitude.trim() : false;
  let quantity = typeof(data.payload.quantity) == 'string' && data.payload.quantity.trim().length > 0 ? data.payload.quantity.trim() : false;
 

  // Error if the email is invalid in all cases
  if(product_id){
    // Error if nothing is sent to update
    if(shipment_date || longitude || latitude || quantity){
      
      // Verify that given token from headers is valid for the email
     
          // Lookup the user
          _data.read('products', product_id, (err, productData)=>{
            if(!err && productData) {
              // Update the necessary fields
              if(shipment_date){
                productData.shipment_date = shipment_date;
              }
              if(longitude){
                productData.longitude = longitude;
              }
              if(latitude){
                productData.latitude = latitude;
              }
              if(quantity){
                productData.quantity = quantity;
              }
              
              // Store the new updates
              _data.update('products', product_id, productData, (err)=>{
                if(!err){
                  callback(200);

                } else {
                  console.log(err);
                  callback(500, {'Error' : 'Could not update the user'});
                }
              })
            } else {
              callback(400, {'Error' : 'The specified product does not exist'})
            }
          })
       
      
    } else {
      callback(400, {'Error' : 'Missing fields to update'});
    }
  } else {
    callback(400, {'Error': 'Missing required field'});
  }
};

// Users - DELETE
// Required field: email
// handlers._users.delete = (data, callback)=>{
//   // Check that email provided is valid
//   let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') > -1 ? data.payload.email.trim() : false;
//   if(email) {
//     // Get the token from the headers
//     let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

//     // Verify that given token from headers is valid for the email
//     handlers._tokens.verifyToken(token, email, (tokenIsValid)=>{
//       if(tokenIsValid){
//          // Lookup the user
//         _data.read('users', email, (err, userData)=>{
//           if(!err && userData){
//             _data.delete('users', email, (err)=>{
//               if(!err){
//                 // Delete each of the orders associated with the user
//                 let userOrders = typeof(userData.orders) == 'object' && userData.checks instanceof Array ? userData.orders : [];
//                 let ordersToDelete = userOrders.length;
//                 if(ordersToDelete > 0){
//                   let ordersDeleted = 0;
//                   let deletionErrors = false;
//                   // Loop through the checks
//                   userOrders.forEach((orderId)=>{
//                     // Delete the order
//                     _data.delete('orders', orderId, (err)=>{
//                       if(err){
//                         deletionErrors = true;
//                       }
//                       ordersDeleted++;
//                       if(ordersDeleted === ordersToDelete){
//                         if(!deletionErrors){
//                           callback(200);
//                         } else {
//                           callback(500, {'Error' :  'Errors encountered while attempting to delete all of the user\'s orders. All orders may not have been deleted from the system successfully'});
//                         }
//                       }
//                     })
//                   })
//                 } else {
//                   callback(200);
//                 }

                
//               } else {
//                 callback(500, {'Error' : 'Could not delete the specified user'});
//               }
//             })
//           } else {
//             callback(400, {'Error' : 'Could not find the specified user'});
//           }
//         });
//       } else {
//         callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
//       }
//     });
//   } else {
//     callback(400, {'Error' : 'Missing required field'})
//   }

// };



// Tokens
// handlers.tokens = (data,callback)=>{
//   let acceptableMethods = ['post', 'get', 'put', 'delete'];
//   if(acceptableMethods.indexOf(data.method) > -1){
//     handlers._tokens[data.method](data, callback);
//   } else{
//     callback(405);
//   }
// }

// Container for all the tokens methods
// handlers._tokens = {};

// Tokens - POST
// Required data: email, password
// Optional data: none
// handlers._tokens.post = (data,callback)=>{
//   let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') > -1 ? data.payload.email.trim() : false;
//   let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

//   if(email && password){
//     // Lookup the user who matches that email
//     _data.read('users', email, (err, userData)=>{
//       if(!err && userData){
//         // Hash the sent password & compare it to the password stored in the user object
//         let hashedPassword = helpers.hash(password);
//         if(hashedPassword == userData.hashedPassword){
//           // If valid, create a new token with a random name. Set expiration date 1 hour in the future
//           let tokenId = helpers.createRandomString(20);

//           let expires = Date.now() + 1000 * 60 * 60;
//           let tokenObject = {
//             'email' : email,
//             'id' : tokenId,
//             'expires' : expires
//           };

//           // Store the token
//           _data.create('tokens', tokenId, tokenObject, (err)=>{
//             if(!err){
//               callback(200, tokenObject);
//             } else {
//               callback(500, {'Error': 'Could not create the new token'});
//             }
//           })
//         } else {
//           callback(400, {'Error' : 'Password did not match the specified user\s stored password'})
//         }
//       } else {
//         callback(400, {'Error' : 'Could not find the specified user'});
//       }
//     })
//   } else {
//     callback(400, {'Error' : 'Missing required fields'});
//   }
// };

// Tokens - GET
// Required data: id
// Optional data: none
// handlers._tokens.get = (data,callback)=>{
//     // Check that the id is valid
//     let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
//     if(id) {
//       // Lookup the user
//       _data.read('tokens', id, (err, tokenData)=>{
//         if(!err && tokenData){
//           callback(200, tokenData);
//         } else {
//           callback(404);
//         }
//       })
//     } else {
//       callback(400, {'Error' : 'Missing required field'})
//     }
// };

// Tokens - PUT
// Required fields: id , extend
// Optional fields: none
// handlers._tokens.put = (data,callback)=>{
//   // Check for the required field
//   let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
//   let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

//   if(id && extend){
//     // Lookup the token
//     _data.read('tokens', id, (err, tokenData)=>{
//       if(!err && tokenData){
//         // Check to make sure the token isn't already expired
//         if(tokenData.expires > Date.now()){
//           // Set the expiration an hour from now
//           tokenData.expires = Date.now() + 1000 * 60 * 60;

//           // Store the new updates
//           _data.update('tokens', id, tokenData, (err)=>{
//             if(!err){
//               callback(200);
//             } else {
//               callback(500, {'Error' : 'Could not update token\s expiration'});
//             }
//           })
//         } else {
//           callback(400, {'Error': 'The token has already expired and cannot be extended'});
//         }

//       } else {
//         callback(400, {'Error': 'Specified token does not exist'});
//       }
//     })
//   } else {
//     callback(400, {'Error' : 'Missing required field(s) or field(s) are invalid'});
//   }


// };

// Tokens - DELETE
// Required data: id
// Optional data: none
// handlers._tokens.delete = (data,callback)=>{
//    // Check that the id is valid
//    let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
//    if(id) {
//      // Lookup the token
//      _data.read('tokens', id, (err, data)=>{
//        if(!err && data){
//          _data.delete('tokens', id, (err)=>{
//            if(!err){
//              callback(200);
//            } else {
//              callback(500, {'Error' : 'Could not delete the specified token'});
//            }
//          })
//        } else {
//          callback(400, {'Error' : 'Could not find the specified token'});
//        }
//      })
//    } else {
//      callback(400, {'Error' : 'Missing required field'})
//    }

// };


// Verify if a given token id is currently valid for a given user
// handlers._tokens.verifyToken = (id, email, callback)=>{
//   // Lookup the token
//   _data.read('tokens', id, (err, tokenData)=>{
//     if(!err && tokenData){
//       // Check that token is for the given user and has not expired
//       if(tokenData.email == email && tokenData.expires > Date.now()){
//         callback(true);
//       } else {
//         callback(false);
//       }
//     } else {
//       callback(false);
//     }
//   })
// };


// Menu
// handlers.menu = (data,callback)=>{
//   let acceptableMethods = ['get'];
//   if(acceptableMethods.indexOf(data.method) > -1){
//     handlers._menu[data.method](data, callback);
//   } else{
//     callback(405);
//   }
// }

// Container for all the menu methods
// handlers._menu = {};

// Menu - GET
// Required data: none
// Optional data: none
// handlers._menu.get = (data, callback)=>{
//   let menu = 'menu';
//   _data.read('menu', menu, (err, data)=>{
//     if(!err && data){
//       // Show the menu
//       callback(200, data);
//     } else{
//       callback(404)
//     }
//   });
// }


// Cart
// handlers.cart = (data,callback)=>{
//   let acceptableMethods = ['post', 'get', 'put', 'delete'];
//   if(acceptableMethods.indexOf(data.method) > -1){
//     handlers._cart[data.method](data, callback);
//   } else{
//     callback(405);
//   }
// }


// Container for all the cart methods
// handlers._cart = {};

// Cart - POST
// Required data: email, itemName, size
// Optional data: none
// handlers._cart.post = (data, callback)=>{
//   // Possible values for the required data
//   let items = ["Pepperoni Pizza", "Cheese Pizza", "Sausage Pizza", "Coke", "Sprite", "Pepsi", "French Fries", "Hot Wings", "Bread Sticks"];
//   let itemSizes = ["small", "medium", "large"];

//   // Check that all required fields are filled out
//   let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') > -1 ? data.payload.email.trim() : false;
//   let itemName = typeof(data.payload.item) == 'string' && items.includes(data.payload.item.trim()) ? data.payload.item.trim() : false;
//   let size = typeof(data.payload.size) == 'string' && itemSizes.includes(data.payload.size.trim())? data.payload.size.trim() : false;

//   if(email && itemName && size){
//     // Get the token from the headers
//     let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

//     // Verify that given token from headers is valid for the email
//     handlers._tokens.verifyToken(token, email, (tokenIsValid)=>{
//       if(tokenIsValid){
//         // Look up user
//         _data.read('users', email, (err, userData)=>{
//           if(!err){
//             // Create a id for the cart item
//             let cartItemId = helpers.createRandomString(9);

//             // Creates cart item object
//             let cartItemObject = {
//               'item' : itemName,
//               'size' : size,
//               'cartItemId' : cartItemId
//             }

//             // add the cart item object to the user 
//             userData.cart.push(cartItemObject);
            
//             // Save the cart item object in the user's cart
//             _data.update('users', email, userData, (err)=>{
//               if(!err){
//                 callback(200, {'Success' :'Successfully added ' + itemName + ' to cart'});
//               } else {
//                 callback(500, {'Error' : 'Could not save item to cart'});
//               }
//             });
//           } else {
//             callback(500, {'Error' : 'Could not find a user with that email'});
//           }
//         });
//       } else {
//         callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
//       }
//     });
//   } else {
//     callback(400, {'Error' : 'Missing Required Fields'});
//   }
// };



// Cart - GET
// Required data: email
// Optional data: none
// handlers._cart.get = (data, callback)=>{
//   // Check that email provided is valid
//   let email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 && data.queryStringObject.email.trim().indexOf('@') > -1 && data.queryStringObject.email.trim().indexOf('.') > -1 ? data.queryStringObject.email.trim() : false;
//   if(email) {
//     // Get the token from the headers
//     let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

//     // Verify that given token from headers is valid for the email
//     handlers._tokens.verifyToken(token, email, (tokenIsValid)=>{
//       if(tokenIsValid){
//          // Lookup the user
//         _data.read('users', email, (err, data)=>{
//           if(!err && data){
//             if(data.cart.length > 0){
//               // Show the cart array
//             callback(200, data.cart);
//             } else{
//               callback(200, {"Message" :'Your cart is empty'})
//             }
//           } else {
//             callback(404);
//           }
//         });
//       } else {
//         callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
//       }
//     });
//   } else {
//     callback(400, {'Error' : 'Missing required field'})
//   }

// };

// Cart - PUT
// Required fields: email, cartItemId
// Optional fields: item, size (must have at least one)
// handlers._cart.put = (data, callback)=>{
//   // Check for the required field
//   let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') > -1 ? data.payload.email.trim() : false;
//   let cartItemId = typeof(data.payload.cartItemId) == 'string' && data.payload.cartItemId.trim().length == 9 ? data.payload.cartItemId.trim() : false;

//   // Possible values for menu items
//   let items = ["Pepperoni Pizza", "Cheese Pizza", "Sausage Pizza", "Coke", "Sprite", "Pepsi", "French Fries", "Hot Wings", "Bread Sticks"];
//   let itemSizes = ["small", "medium", "large"];

//   // Check for optional fields
//   let itemName = typeof(data.payload.item) == 'string' && items.includes(data.payload.item.trim()) ? data.payload.item.trim() : false;
//   let size = typeof(data.payload.size) == 'string' && itemSizes.includes(data.payload.size.trim())? data.payload.size.trim() : false;

//   // Error if the email is invalid in all cases
//   if(email){
//     // Error if nothing is sent to update
//     if(email || itemName || size){
//       // Get the token from the headers
//       let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

//       // Verify that given token from headers is valid for the email
//       handlers._tokens.verifyToken(token, email, (tokenIsValid)=>{
//         if(tokenIsValid){
//           // Lookup the user
//           _data.read('users', email, (err, userData)=>{
//             if(!err && userData.cart.length > 0) {
//               // Verify a cart item ID was passed in
//               if(cartItemId){
//                 userData.cart.forEach((cartItem)=>{
//                   // Only update the cart item with the cart id that was passed in
//                   if(cartItem.cartItemId == cartItemId){
//                     if(itemName){
//                       cartItem.item = itemName;
//                     }
//                     if(size){
//                       cartItem.size = size;
//                     }
//                   }
//                 });

//                 // Store the new updates
//                 _data.update('users', email, userData, (err)=>{
//                   if(!err){
//                     callback(200 , {'Success' : 'Cart was successfully updated'});

//                   } else {
//                     callback(500, {'Error' : 'Could not update the cart item'});
//                   }
//                 });
//               } else{
//                 callback(400, {'Error' : 'Invalid cart ID'});
//               }
//             } else {
//               callback(400, {'Error' : 'This cart is empty'});
//             }
//           });
//         } else {
//           callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
//         }
//       });
//     } else {
//       callback(400, {'Error' : 'Missing fields to update'});
//     }
//   } else {
//     callback(400, {'Error': 'Missing required field'});
//   }
// };


// Cart - DELETE
// Required fields: email
// Optional fields: cartItemId (if not provided, delete every item in cart)
// handlers._cart.delete = (data, callback)=>{
//   // Check that email provided is valid
//   let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') > -1 ? data.payload.email.trim() : false;
//   let cartItemId = typeof(data.payload.cartItemId) == 'string' && data.payload.cartItemId.trim().length == 9 ? data.payload.cartItemId.trim() : false;

//   if(email) {
//     // Get the token from the headers
//     let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

//     // Verify that given token from headers is valid for the email
//     handlers._tokens.verifyToken(token, email, (tokenIsValid)=>{
//       if(tokenIsValid){
//          // Lookup the user
//         _data.read('users', email, (err, userData)=>{
//           if(!err && userData){
//             if(cartItemId){
//               // Delete one particular cart item
//               let newCartArray = userData.cart.filter((obj)=>{
//                 return obj.cartItemId !== cartItemId;
//               });

//               // Reassign the user's cart with the new cart array
//               userData.cart = newCartArray;

//               // Store the new cart data
//               _data.update('users', email, userData, (err)=>{
//                 if(!err){
//                   callback(200 , {'Success' : 'Item deleted from cart'});

//                 } else {
//                   callback(500, {'Error' : 'Could not delete the item from the cart'});
//                 }
//               });
//             } else{
//               // Delete every item in cart
//               // Reassign the user's cart with an empty array
//               userData.cart = [];

//               // Store the new cart data
//               _data.update('users', email, userData, (err)=>{
//                 if(!err){
//                   callback(200 , {'Success' : 'All items in cart deleted'});

//                 } else {
//                   callback(500, {'Error' : 'Could not delete all items from the cart'});
//                 }
//               });
//             }
//           } else {
//             callback(400, {'Error' : 'Could not find the specified user'});
//           }
//         });
//       } else {
//         callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
//       }
//     });
//   } else {
//     callback(400, {'Error' : 'Missing required field'})
//   }

// };



// Orders
// handlers.orders = (data,callback)=>{
//   let acceptableMethods = ['post'];
//   if(acceptableMethods.indexOf(data.method) > -1){
//     handlers._orders[data.method](data, callback);
//   } else{
//     callback(405);
//   }
// }

// Container for all the check methods
// handlers._orders = {};

// Checks - POST
// Required data: email, 
// Optional data: none
// handlers._orders.post = (data, callback)=>{
//   // Check that email provided is valid
//   let email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 && data.queryStringObject.email.trim().indexOf('@') > -1 && data.queryStringObject.email.trim().indexOf('.') > -1 ? data.queryStringObject.email.trim() : false;
//   if(email) {
//     // Get the token from the headers
//     let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

//     // Verify that given token from headers is valid for the email
//     handlers._tokens.verifyToken(token, email, (tokenIsValid)=>{
//       if(tokenIsValid){
//          // Lookup the user
//         _data.read('users', email, (err, userData)=>{
//           if(!err && userData.cart.length > 0){
//             let menu = 'menu';
//             _data.read('menu', menu, (err, data)=>{
//               if(!err && data){
//                 let prices = [];
//                 // Grab price of each cart item from menu
//                 userData.cart.forEach((cartItem)=>{
//                   if(data.hasOwnProperty(cartItem.item)){
//                     for(let key in data[cartItem.item]){
//                       if(key == cartItem.size){
//                         prices.push(Number(data[cartItem.item][cartItem.size].substring(1)));
//                       }
//                     }
//                   }
//                 });

//                 // Add Prices
//                 let addPrices = prices.reduce((count, num)=>{
//                   return count += num;
//                 });

//                 // Final price with tax and $3 delivery charge
//                 let finalPriceWithTaxAndDeliveryCharges = (addPrices * 1.08 + 3).toFixed(2) * 100;
//                 let token = 'tok_visa';
//                 let charge = {
//                   'amount' : finalPriceWithTaxAndDeliveryCharges,
//                   'currency' : 'usd',
//                   'description' : 'Charges for your order',
//                   'source' : token,
//                   'chargeId' : helpers.createRandomString(10),
//                   'timestamp' : Date.now(),
//                   'userEmail' : email
//                 };

//                 // Charge card, send confirmation email, and create order save order object to file system
//                 helpers.stripe(charge.amount, charge.currency, charge.description, charge.source, (err)=>{
//                   if(err){
//                     callback(500, { 'Error': 'There was an error processing your payment'});
//                   } else{
//                     let message = `Thank you for placing your order ${userData.firstName}. \n\n Confirmation: #${charge.chargeId} Total: $${charge.amount / 100}. \n\n Your order will be delivered within 30 - 45 minutes.`;
//                     helpers.mailgun(email, 'Order Confirmation', message, (err)=>{
//                       if(!err){
//                         // Create and store the order
//                         _data.create('orders', email + '-' + charge.timestamp, charge, (err)=>{
//                           if(!err){
//                             // Empty the user's cart
//                             userData.cart = [];
//                             _data.update('users', email, userData, (err)=>{
//                               if(!err){
//                                 console.log('Cart emptied successfully')
//                                 callback(200, {"Success" : "Your order was processed successfully"});
//                               } else {
//                                 callback(500, {'Error' : 'Could not empty the cart'});
//                               }
//                             });
//                           } else {
//                             callback(500, {"Error" : "Error encountered creating order. It may already exist"})
//                           }
//                         });
//                         console.log('Confirmation email sent successfully');
//                       } else{
//                         console.log('Problem processing email: ' + err);
//                         callback(500, {'Error' : 'Problem encountered sending confirmation email'})
//                       }
//                     });
//                   }
//                 });
//               } else{
//                 callback(404)
//               }
//             }); 
//           } else {
//             callback(400, {'Error' : "Cart is empty"});
//           }
//         });
//       } else {
//         callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
//       }
//     });
//   } else {
//     callback(400, {'Error' : 'Missing required field'})
//   }

// };


// Ping Handler 
// handlers.ping = (data, callback)=>{
//   callback(200);
// };

// // Not Found Handler
// handlers.notFound = (data, callback)=>{
//   callback(404);
// };

// // Oracle
// handlers.oracle = (data,callback)=>{
//   // let acceptableMethods = ['post', 'patch', 'get', 'put', 'delete'];
//   let acceptableMethods = ['get'];
//   if(acceptableMethods.indexOf(data.method) > -1){
//     handlers._oracle[data.method](data, callback);
//   } else{
//     callback(405);
//   }
// }

// // Container for all the oracle methods
// handlers._oracle = {};




handlers.oracle = function(data,callback) {
  callback(406,{'name':'oracle handler'});
}

// Define a not find handler
handlers.notFound = function(data,callback){
  callback(404);
}

// Export the module
module.exports = handlers;