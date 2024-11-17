const app = require('./app');

const server = app.listen(3000, () =>
    console.log(`
  🚀 Server ready at: http://localhost:3000
  ⭐️ See sample requests: http://pris.ly/e/js/rest-express#3-using-the-rest-api`),
)