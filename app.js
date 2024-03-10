const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv').config();
const flash = require("connect-flash");
const secretKey = process.env.secret;
const port = process.env.PORT || 7001;
const app = express();


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: secretKey,
    resave: true,
    saveUninitialized: false
}));
app.use(flash());

// Routes
const userRouter = require("./src/router/user");
const adminRouter = require("./src/router/admin");
app.use("/admin", adminRouter);
app.use("/user", userRouter);

// View engine setup
app.set("view engine", "ejs");
app.set("views", "view");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose.connect('mongodb://localhost:27017/mainproject')
    .then(() => {
        console.log("Database connected");
        // Start the server
        app.listen(port, () => {
            console.log("Server started on port", port);
        });
    })
    .catch(err => {
        console.error("Database connection error:", err);
        process.exit(1); // Exit with error
    });
