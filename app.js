var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
var investmentRouter = require('./routes/investments');
var expenseTrackerRouter = require('./routes/expensetracker');
var transactionRouter = require('./routes/transactions')

var app = express();
const swaggerDocument = require('./swagger-output.json');
const corsOptions = {
  origin: ['http://localhost:5173', 'https://frost2k5.is-a.dev'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(corsOptions))

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/user', userRouter);
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);
app.use('/api', investmentRouter);
app.use('/api', expenseTrackerRouter);
app.use('/api', transactionRouter)
app.use('/',express.static(path.join(__dirname, 'public')));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  const error = {
    "status": "error",
    "errors": err.message,
  }
  res.json(error);
});

module.exports = app;
