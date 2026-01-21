require("dotenv").config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const sequelize = require("./models/db");
const { DataTypes } = require("sequelize");
const User = require("./models/user")(sequelize, DataTypes);

const webRoutes = require("./routes/web");
const authRoutes = require("./routes/auth");

const hbs = require('hbs');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        name: "sessionId",                 
        secret: "lsnflsknlkdsnkljtw54jhuotvrehtoivu34vtihehtvlwureghweuithuierhgiudgtrhefbgjfdbgkljdwhgjt",         
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,      
            httpOnly: true                    
        }
    })
);

app.use(flash());

// Carica l"utente dalla sessione
app.use(async (req, res, next) => {
	if (req.session.userId) {
		req.user = await User.findByPk(req.session.userId);
	} else {
		req.user = null;
	}
	res.locals.user = req.user;
	res.locals.messages = req.flash();
	next();
});

app.use(express.static(path.join(__dirname, 'public')));

hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
app.set("view engine", "hbs");

app.use("/", webRoutes);
app.use("/auth", authRoutes);

sequelize.sync().then(() => {
	app.listen(3000);
});
