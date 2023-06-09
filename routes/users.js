const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const { checkReturnTo } = require("../middleware.js");
const users = require("../controllers/users");
router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router.route("/login").get(users.renderLogin).post(
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
  }),
  users.login
);

router.get("/logout", users.logout);
module.exports = router;
