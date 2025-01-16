const mongoose = require('mongoose');
const dotenv = require('dotenv');

// handling sysnchronous Error
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception : Shutting Down');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB =
  // process.env.DATABASE_LOCAL ||
  process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connected Successfully'));

// console.log(process.env);
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is listening on the port ${PORT}`);
});

// handling unhandled error

// Asynchronous Error
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection : Shutting Down');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
