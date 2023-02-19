const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const Review = require("../models/review");
const Campground = require("../models/campground")
const campgrounds = require("../routes/campgrounds")
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware")
const reviews = require("../controllers/reviews")



router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete("/:reviewID", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;