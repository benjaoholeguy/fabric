# Oracle API (Node.JS)

## Rest API for a Pizza Delivery company written in plain Node.JS.  No NPM modules or external libraries.

### Specs

1. New users can be created, their information can be edited, and they can be deleted. We store their name, email address, and street address.
2. Users can log in and log out by creating or destroying a token.

3. When a user is logged in, they are able to GET all the possible menu items.
4. A logged-in user is able to fill a shopping cart with menu items
5. A logged-in user is able to create an order. Integrated with the Sandbox of Stripe.com to accept their payment.
6. When an order is placed, automatically email the user a receipt. Integrated with the sandbox of Mailgun.com for this. 
---
## REST Endpoints

### ```/users```

##### POST

- Create a new user. Each user must have a unique email address.  
Required fields: (in JSON payload) `firstName`, `lastName`, `email`, `password`, `streetAddress`, `city`, `state`, `zipCode`, `tosAgreement`
Requires Token: No

##### GET

- Retrieve data for an existing user as JSON.  
Required fields: (in query string) `email`  
Requires Token: Yes

##### PUT

- Update an existing user.  
Required fields: (in JSON payload) `email`  
Optional fields: (in JSON payload) `firstName`, `lastName`, `password`, `streetAddress`, `city`, `state`, `zipCode` (at least one must be specified)  
Requires Token: Yes

##### DELETE

- Delete an existing user.  
Required fields: (in JSON payload) `email`  
Requires Token: Yes

### `/tokens`

##### POST

- Create a token for a user. (log in)  
Required fields: (in JSON payload) `email`, `password`  
Requires Token: No

##### GET

- Lookup the token for a user.  
Required fields: (in query string) `id`   
Requires Token: No

##### PUT 

- Extend a token for a user.  
Required fields: (in JSON payload) `email`, `extend`  
Requires Token: Yes 

##### DELETE

- Remove a token for a user. (log out)  
Required fields: (in query string) `id`  
Requires Token: Yes 

### `/menu`

##### GET

- Get pizza menu. Returns a JSON object containing menu information.  
Required fields: None  
Requires Token: No

### `/cart`

##### POST

- Add a menu item to the user's cart.  
Required fields: (in JSON payload) `email`, `itemName`, `size`  
Requires Token: Yes 

##### GET

- Fetch the cart of the user. Returns a JSON object containing cart information.
Required fields: (in query string) `email`
Requires Token: Yes

##### PUT

- Update the cart of the user.  
Required fields: (in JSON payload) `email`, `cartItemId`  
Requires Token: Yes

##### DELETE

- Delete either one specific item or all items in the cart of the user.
Required fields: (in JSON payload) `email`  
Optional fields: `cartItemId` (if not included all items in cart removed)  
Requires Token: Yes

### `/orders`

##### POST

- Generate an order for the user using their current cart contents and account information on file. Card is charged using a HTTPS request to Stripe API & confirmation email is sent using a HTTPS request to Mailgun API  
Required fields: (in query string) `email`  
Requires Token: Yes 
