const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');

// mergeParams allows to tale params or merge them from parent params
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(authController.restrictTo('admin'), reviewController.deleteReview);

module.exports = router;
