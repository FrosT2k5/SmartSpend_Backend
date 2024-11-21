const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'});

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
  servers: [
    {
      url: "https://smartspend-h6cxb0dng5ardeef.centralindia-01.azurewebsites.net/",
      description: "Public API Server"
    },
    {
      url: "http://localhost:3000/",
      description: "LocalHost Server"
    }
  ],
};

const outputFile = './swagger-output.json';
const routes = ['./app.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);