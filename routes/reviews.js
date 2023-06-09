const express = require("express");
const router = express.Router({ mergeParams: true });
const { campgroundSchema, reviewSchema } = require("../schemas.js");
const Review = require("../models/review");
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const reviews = require("../controllers/reviews")


const {
  validateReview,
  isLoggedIn,
  isReviewAuthor
} = require("../middleware.js");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
