if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const port = process.env.PORT || 3000;


const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")

const MongoDBStore = require('connect-mongo')(session); 
// process.env.DB_URL ||
const dburl =process.env.DB_URL ||  "mongodb://localhost:27017/yelp-camp"
// "mongodb://localhost:27017/yelp-camp"
mongoose.connect(dburl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => { 
  console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, "public")))
app.use(mongoSanitize({
  replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeasecret';

const store = new MongoDBStore({
  url:dburl,
  secret:secret,
  touchAfter:24*60*60
});

store.on("error", function(e){
  console.log("session store error", e)
})

const sessionConfig = {
  store,
  name: 'session',
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
     expires: Date.now() + 1000*60*60*24*7,
     maxAge: 1000*60*60*24*7
  }
  
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.session)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success')
  res.locals.error = req.flash("error")
  next();
})


app.use("/",userRoutes)
app.use("/campgrounds",campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)


app.get("/", (req, res) => {
  res.render("home");
});

app.all('*',(req,res,next)=>{ 
  next(new ExpressError('Page not found',404))
})

app.use((err,req,res,next)=>{
  const {statusCode = 500}=err;
  if(!err.message) err.message = "Ohh No, Something went wrong"
  res.status(statusCode).render("error",{err})
});

app.listen(port, () => {
  console.log("listening on 3000");
});

