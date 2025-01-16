const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // allow nested get all review of a tour
    const filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    // SENDING RESPONSE
    res.status(200).json({
      status: 'success',
      result: doc.length,
      requestTime: req.requestTime,
      data: {
        data: doc,
      },
    });

    try {
      // BUILDING QUERY
      // { difficulty : 'easy', duration : { $gte : 5 } }
      /* 
        1A) Filtering
        const queryObj = { ...req.query };
  
        // removing not required fields from query
        const excludedFields = [
          'page',
          'sort',
          'fields',
          'limit',
        ];
  
        excludedFields.forEach(
          (el) => delete queryObj[el]
        );
  
      */
      /*
        1B) Advance Filtering
        // params duration[gre]=23
        const queryStr = JSON.stringify(
          queryObj
        ).replace(
          /\b(lt|gt|lte|gte)\b/g,
          (match) => `$${match}`
        );
  
        let query = Tour.find(JSON.parse(queryStr));
      */
      /*
        ways of filtering
        // const query = Tour.find({difficulty: 'easy',duration: 5});
        // const query = Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
      */
      /* 
        //2 SORT
        // paras = sort=price,duration
        if (req.query.sort) {
          const sortingBy = req.query.sort
            .split(',')
            .join(' ');
  
          query = query.sort(sortingBy);
          // sort('price ratingsAverage')
        } else {
          query = query.sort('-createdAt');
        }
      */
      /* 
        // 3) Limiting Fields
        // params fields=name,price,duration
        // (for hiding field internally we use schema)
        if (req.query.fields) {
          const extractingFields = req.query.fields
            .split(',')
            .join(' ');
  
          query = query.select(extractingFields);
        } else {
          query = query.select('-__v');
        } 
      */
      /* 
        // 4) pagination(limiting document)
        // params page=2&limit=100
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 0;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
  
        // skipping more pages compare to actually exist so, we throw error in this case 
        if (req.query.page) {
          const noOfTour =
            await Tour.countDocuments();
  
          if (noOfTour <= skip) {
            throw new Error(
              'This Page Does not Exists'
            );
          }
        }
      */
      // EXECUTING QUERY
      // const tours = await query;
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    // const id = req.params.id * 1;
    // const tour = tours.find((el) => el.id === id);

    if (!doc) return next(new AppError('No document exist with this  ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    /*
   try {
    
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
   */
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    /*
     try {
      // const newID = tours[tours.length - 1].id + 1;
      // const newTour = {
      //   id: newID,
      //   ...req.body,
      // };
      // tours.push(newTour);
      // fs.writeFile(
      //   `${__dirname}/dev-data/data/tours-simple.json`,
      //   JSON.stringify(tours),
      //   (err) => {
      //     res.status(201).json({
      //       status: 'success',
      //       data: {tour: newTour},
      //     });
      //   }
      // );
      // const newTour = new Tour({});
      // newTour.save();

      //alternative
    } catch (err) {
      res.status(400).json({
        status: 'fail',
      });
    } 
    */
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return newly updated documents
      runValidators: true,
    });

    if (!doc) return next(new AppError('No document exist with this  ID', 404));

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });

    /*  
     try {
        // const { id } = req.params;
        // const tourIxd = tours.findIndex(
        //   (t) => t.id === id
        // );
        // const tour = Object.assign(
        //   tours[tourIxd],
        //   req.body
        // );
        // tours[tourIxd] = tour;
        // fs.writeFile(
        //   `${__dirname}/dev-data/data/tours-simple.json`,
        //   JSON.stringify(tours),
        //   (err) => {
        //     res.status(201).json({
        //       status: 'success',
        //       data: {
        //         tour,
        //       },
        //     });
        //   }
        // );
      } catch (err) {
        res.status(404).json({
          status: 'fail',
          message: err,
        });
      } 
        */
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No document exist with this  ID', 404));

    res.status(204).json({
      status: 'success',
      data: null,
    });

    /* 
      try {
        // const { id } = req.params;
        // const tourIxd = tours.findIndex(
        //   (t) => t.id === id
        // );
        // tours.splice(tourIxd, 1);
        // fs.writeFile(
        //   `${__dirname}/dev-data/data/tours-simple.json`,
        //   JSON.stringify(tours),
        //   (err) => {
        //     res.status(204).json({
        //       status: 'success',
        //       data: null,
        //     });
        //   }
        // );
      } catch (err) {
        res.status(404).json({
          status: 'fail',
          message: err,
        });
      }
    } 
      */
  });
