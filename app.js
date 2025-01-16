const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const tourRoute = require('./routes/tourRoutes');
const userRoute = require('./routes/userRoutes');
const reviewRoute = require('./routes/reviewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, `/public/`)));

// 1) GLOBAL MIDDLE WARE
// SECURITY HTTP HEADERs
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // {dev | tiny}
}

// for limit the access to the user from the same Ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limiter);

// body parser
app.use(express.json({ limit: '10kB' }));

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data senitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficuly',
      'price',
    ],
  })
);

// creating middleware function
// app.use((req, res, next) => {
//   console.log('Hello from the Middle Ware😉');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//2) ROUTE HANDLER

// 3) ROUTES

// app.get('/api/v1/tours', getAllTours);  // accessing all the tours
// app.get('/api/v1/tours/:id', getTour);  // accessing single tour
// app.post('/api/v1/tours', createTour);  // creatig new tours
// app.patch('/api/v1/tours/:id', updateTour); // updating tour
// app.delete('/api/v1/tours/:id', deleteTour);  // deleting tour

app.get('/', (req, res) => {
  res.status(200).render('base', {
    // tour: 'The Forest Hiker',
    user: 'sarwang Jain',
  });
});
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);

// all other routes
app.all('*', (req, res, next) => {
  /* 
    res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server`,
    });
  */

  /* 
    const err = new Error(
      `Can't find ${req.originalUrl} on this server`
    );
    err.status = 'fail';
    err.statusCode = 404;
    next(err);
  */

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

// 4) START SERVER
module.exports = app;
