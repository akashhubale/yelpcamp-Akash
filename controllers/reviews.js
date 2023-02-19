const Review = require("../models/review");
const Campground = require("../models/campground")

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    review.author = req.user._id;
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!")
    res.redirect(`/campgrounds/${campground._id}/`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewID } = req.params;
    await Campground.findOneAndUpdate(id, { $pull: { reviews: reviewID } })
    await Review.findByIdAndDelete(req.params.reviewID);
    req.flash("success", "Successfully deleted a review!")
    res.redirect(`/campgrounds/${id}`);
}