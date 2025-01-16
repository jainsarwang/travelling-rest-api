const mongoose = require('mongoose');
const validator = require('validator');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
      required: [true, 'Rating is Required'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must be writtern by a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index(
  {
    tour: 1,
    user: 1,
  },
  {
    unique: true,
    comment: 'Making one user can have only one tour',
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'tour', select: 'name' }).populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// calculating averanging and storing it on the tour model
//static method
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0]?.nRatings ?? 0,
    ratingsAverage: stats[0]?.avgRating ?? 4.5,
  });
};

reviewSchema.post('save', function () {
  // this.constructoor -> current model
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // this.findOne() does not work here, as the query is already executed
  await this.r.constructor.calcAverageRatings(this.r.tour._id);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
