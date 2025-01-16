const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

// crating schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'A tour must have a Name'],
      maxlength: [40, 'A tour name must have less or equal 40 characters'],
      minlength: [10, 'A Tour name must have more or equal to 10 characters'],
      // validate: [validator.isAlpha, 'Only Alpha character are allowed'],
    },
    slug: {
      type: String,
      // required: true,
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can be Easy, Medium and Difficult only',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 5.0,
      min: [1, 'Rating must be 1 or Above'],
      max: [5, 'Rating must be 5 or below'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: {
      type: Number,
      //custom validators
      validate: {
        validator: function (val) {
          // work only  in NEWLY created document
          // this -> current document of NEWLY created document
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have Description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      requires: [true, 'A tour must have a cover Image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // hide data from sending to client
    },
    startDates: [Date],
    secret: Boolean,
    startLocation: {
      // GeoJSON for geospacial
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true }, // when data is output as JSON this will apply
    toObject: { virtuals: true }, // when data is output as OBJECT this will apply
  }
);

// creating indexes
// tourSchema.index({
//   price: 1,
// });
tourSchema.index({
  price: 1,
  ratingsAverage: -1,
});

tourSchema.index({
  slug: 1,
});

tourSchema.index({
  startLocation: '2dsphere',
});

// defining virtual property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
  options: {
    select: '-tour',
  },
});

/*
mongo middleware also called pre and post hooks
types:
  document -> saving document
  Query -> find query
  Aggregate -> aggregation happend
  model middleware -> 
*/
// DOCUMENT middleware : runs before documents save to database (.save() and .create() but not in .insertMany())
tourSchema.pre('save', function (next) {
  // this -> current document
  this.slug = slugify(this.name, {
    lower: true,
  });

  next();
});

/* 
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});
 */

// QUERY MIDDLEWARE
/* work for find only */
/* tourSchema.pre('find', function (next) {
  this.find({ secret: { $ne: true } });
  next();
});

tourSchema.pre('findOne', function (next) {
  this.find({ secret: { $ne: true } });
  next();
}); */

tourSchema.pre(/^find/, function (next) {
  // this -> current query
  this.find({ secret: { $ne: true } });

  // counting time
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, function (err, next) {
  console.log(`Query Took ${Date.now() - this.start} milliseconds`);

  next();
});

// AGGREGATION MIDDLEWARE
/* tourSchema.pre('aggregate', function (next) {
  // this -> current aggregate

  // console.log(this);

  // removing secret document
  this.pipeline().unshift({
    $match: {
      secret: {
        $ne: true,
      },
    },
  });

  console.log(this.pipeline());

  next();
});
 */
//creating model(model required to perform each of CRUD operations)
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
