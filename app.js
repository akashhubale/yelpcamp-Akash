if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStratergy = require("passport-local");
const User = require("./models/user")
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo")(session)
// const helmet = require("helmet");


const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews");
const { default: helmet } = require("helmet");
const { Session } = require("express-session");
const dbUrl = process.env.MONGODB_URI

// mongoose.connect(dbUrl, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error"))

// db.once("open", () => {
//     console.log("Database connected")
// })


const app = express();

mongoose.set("strictQuery", false);
const connect = async () => {
    try {
        const conn = await mongoose.connect(dbUrl);
        console.log("database connected")
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

app.engine("ejs", ejsMate)
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
    replaceWith: "_"
}))

const secret = process.env.SECRET || "thisshouldbebettersecret"

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
})

store.on("error", function () {
    console.log("STORE ERROR")
})

const sessionconfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httponly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}



app.use(session(sessionconfig))
app.use(flash());
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:");
    next();
});

app.use(
    helmet.contentSecurityPolicy({
        useDefaults: false,
    }),
);


const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dyjzeodgl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next();
})

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
    res.render("home")
})

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) message = "Something went wrong"
    res.status(statusCode).render("error", { err })
})

const port = process.env.PORT_NO || 3000
connect().then(() => {
    if (err) { console.error(err); return false; }
    app.listen(port, () => {
        console.log(`Serving on port ${port}`)
    })
})

