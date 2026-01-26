require("dotenv").config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const sequelize = require("./models/db");
const { DataTypes } = require("sequelize");
const User = require("./models/user")(sequelize, DataTypes);

const webRoutes = require("./routes/web");
const authRoutes = require("./routes/auth");

const hbs = require("hbs");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        name: "sessionId",
        // Secret da .env
        secret: process.env.SESSION_SECRET,
        // Salva solo se modificata 
        resave: false,
        // Non crea sessione finché non viene creato qualcosa
        saveUninitialized: false,
        cookie: {
            // Durata cookie di 24 ore
            maxAge: 24 * 60 * 60 * 1000,
            // JS non può accedere al cookie
            // Protegge da XSS
            httpOnly: true                    
        }
    })
);

app.use(flash());

// Carica l"utente dalla sessione
// Serve per far funzionare le sessioni
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

// Funzione di HBS che mi permette di calcolare la media
// Non si può fare direttamente if plays > 0 quindi devo fare in questo modo
hbs.registerHelper("average", function(total, plays) {
	if (plays > 0) {
		return (total / plays).toFixed(2);
	}
	return "N/A";
});

app.use(express.static(path.join(__dirname, "public")));

hbs.registerPartials(path.join(__dirname, "views", "partials"));
app.set("view engine", "hbs");

app.use("/", webRoutes);
app.use("/auth", authRoutes);

sequelize.sync().then(() => {
	app.listen(3000);
});
