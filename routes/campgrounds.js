const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review")
const {campgroundSchema, reviewSchema} = require("../schemas.js");
const {isLoggedIn,validateCampground,isAuthor} = require("../middleware")



router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);
router.get("/new",isLoggedIn, (req, res) => {

  res.render("campgrounds/new");
});
router.post(
  "/",isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if(!req.body.campgrounds) throw new ExpressError('Invalid Campground Data',400)
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', "Successfully made new campground!!")
    res.redirect(`campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id/edit",isLoggedIn,isAuthor,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
      req.flash("error", "Campground not found")
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      {path:'reviews',
      populate:{
        path:'author'
      }}).populate("author");
    console.log(campground)
    if(!campground){
      req.flash("error", "Campground not found")
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground, });
  })
);
router.put(
  "/:id",isLoggedIn,isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground
    });
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",isLoggedIn,isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the campground")
    res.redirect("/campgrounds");
  })
);

module.exports = router;