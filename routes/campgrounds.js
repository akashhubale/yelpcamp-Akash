const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground")
const campgrounds = require("../controllers/campgrounds")
const { isLoggedIn, isauthor, validateCampground } = require("../middleware");
const { storage } = require("../cloudinary/index")
const multer = require("multer")
const limits = { fileSize: 1000 * 1000 * 4 };
const upload = multer({ storage, limits })




router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))


router.get("/new", isLoggedIn, campgrounds.newForm);

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isauthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isauthor, catchAsync(campgrounds.deleteCampground))

router.get("/:id/edit", isLoggedIn, isauthor, catchAsync(campgrounds.editCampground));



module.exports = router;