const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Personal Finance Manager API',
    description: 'API Docs'
  },
  components: {
    securitySchemes:{
        bearerAuth: {
            type: 'http',
            scheme: 'bearer'
        }
    }
  },
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization', // name of the header, query parameter or cookie
      description: 'Enter your bearer token in the format: Bearer **&lt;token>**'
    }
  },
  host: 'localhost:3000',
};

const outputFile = './swagger-output.json';
const routes = ['./app.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);