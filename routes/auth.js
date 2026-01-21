const express = require("express");
const bcrypt = require("bcrypt");
const sequelize = require("../models/db");
const { DataTypes } = require("sequelize");
const User = require("../models/user")(sequelize, DataTypes);

const router = express.Router();

router.get("/register", (req, res) => {
	res.render("register", {
		layout: "main",
		title: "Register", 
		user: req.user 
	});
});

router.get("/login", (req, res) => {
	res.render("login", {
		layout: "main",
		title: "Login", 
		user: req.user 
	});
});

router.post("/register", async (req, res) => {
	let { email, username, password, confirm } = req.body;

	if (!email || !username || !password || !confirm) {
		req.flash("error", "Please fill out all fields.");
		return res.redirect("/auth/register");
	}

	if (password !== confirm) {
		req.flash("error", "Passwords do not match.");
		return res.redirect("/auth/register");
	}

	let existingEmail = await User.findOne({ where: { email } });
	if (existingEmail) {
		req.flash("error", "Email already registered.");
		return res.redirect("/auth/register");
	}

	let existingUsername = await User.findOne({ where: { username } });
	if (existingUsername) {
		req.flash("error", "Username already taken.");
		return res.redirect("/auth/register");
	}

	let password_hash = await bcrypt.hash(password, 10);

	let user = await User.create({
		email,
		username,
		password_hash
	});

	req.session.userId = user.id;
	req.user = user;

	return res.redirect("/auth/profile");
});

router.post("/login", async (req, res) => {
	let { email, password } = req.body;

	let user = await User.findOne({ where: { email } });

	if (!user) {
		req.flash("error", "Invalid username.");
		return res.redirect("/auth/login");
	}

	let valid = await bcrypt.compare(password, user.password_hash);

	if (!valid) {
		req.flash("error", "Invalid password.");
		return res.redirect("/auth/login");
	}

	req.session.userId = user.id;
	req.user = user;

	return res.redirect("/auth/profile");
});

router.get("/logout", (req, res) => {
	req.session.destroy(() => {
		res.redirect("/");
	});
});

router.get("/profile", ensureAuth, (req, res) => {
	res.render("profile", {
		layout: "main",
		title: "Profile", 
		user: req.user
	 });
});

function ensureAuth(req, res, next) {
	if (!req.user) {
		return res.redirect("/auth/login");
	}
	next();
}

module.exports = router;
