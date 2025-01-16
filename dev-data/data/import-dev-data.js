const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

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

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);

    console.log('Data Successfully Loaded!!');
  } catch (err) {
    console.error(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();

    console.log('Data Successfully Deleted!!');
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
