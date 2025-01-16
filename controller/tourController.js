// const fs = require('fs');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

/* 
  const tours = JSON.parse(
    fs.readFileSync(
      `${__dirname}/../dev-data/data/tours-simple.json`
    )
  );

  exports.checkID = (req, res, next, val) => {
    if (val * 1 >= tours.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });
    }

    next();
  };
*/

/* 
  exports.checkBody = (req, res, next) => {
    const { body } = req;

    if (!body.name || !body.price) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Missing Parameters (name or price)',
      });
    }

    next();
  };
 */

exports.aliasTopTours = async (req, res, next) => {
  // limit=5&sort=-ratingAverage,price&fields=name,price,ratingAverage,summary,difficulty

  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';

  next();
};

exports.getAllTours = handlerFactory.getAll(Tour);

exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' });

exports.createTour = handlerFactory.createOne(Tour);

exports.updateTour = handlerFactory.updateOne(Tour);

exports.deleteTour = handlerFactory.deleteOne(Tour);

exports.getTourStat = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numOfTour: {
          $sum: 1,
        },
        numOfRatings: {
          $sum: '$ratingQuatity',
        },
        avgRating: {
          $avg: '$ratingsAverage',
        },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });

  /* try {
      
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    } */
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      // create document for each of the start date
      $unwind: '$startDates',
    },
    {
      // select data of a particular year
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year + 1}-12-31`),
        },
      },
    },
    {
      // grouping the result
      $group: {
        _id: {
          $month: '$startDates', // get the month number from the date
        },
        numTourStarts: {
          $sum: 1,
        },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      // adding a new field to the document
      $addFields: { month: '$_id' },
    },
    {
      // remove fields from documents
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      // limit the number of document
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    totalTours: plan.length,
    message: {
      plan,
    },
  });
  /* try {
      
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    } */
});

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
    {
      $sort: {
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
