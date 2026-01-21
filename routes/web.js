// Aiuto di ChatGPT per convertire le pagine da Flask a Node/Express
const express = require("express");
const axios = require("axios");
const sequelize = require("../models/db");
const { DataTypes } = require("sequelize");
const User = require("../models/user")(sequelize, DataTypes);

const router = express.Router();

let userAgent = "progetto-node/1.0 (esteban.storelli@samtrevano.ch)";

class Article {
	constructor(title, body) {
		this.title = title;
		this.body = body;
		this.word_count = body.split(/\s+/).length;
	}
}

router.get("/", (req, res) => {
    let username = "Guest";
    if (req.user) {
        username = req.user.username;
    }
	res.render("main_page", {
        layout: "main",
        title: "The Wikipedia Word Guesser!",
		username: username
	});
});

async function getRandomArticle() {
	let response = await axios.get("https://en.wikipedia.org/w/api.php", {
		params: {
			format: "json",
			action: "query",
			list: "random",
			rnlimit: 1,
			rnnamespace: 0
		},
		headers: {
			"User-Agent": userAgent
		}
	});

	let title = response.data.query.random[0].title;

	let bodyResp = await axios.get("https://en.wikipedia.org/w/api.php", {
		params: {
			format: "json",
			action: "query",
			prop: "extracts",
			explaintext: true,
			titles: title
		},
		headers: {
			"User-Agent": userAgent
		}
	});

	let pages = bodyResp.data.query.pages;
	let pageId = Object.keys(pages)[0];
	let body = pages[pageId].extract || "";

	return new Article(title, body);
}

async function getArticleByTitle(title) {
	let bodyResp = await axios.get("https://en.wikipedia.org/w/api.php", {
		params: {
			format: "json",
			action: "query",
			prop: "extracts",
			explaintext: true,
			titles: title
		},
		headers: {
			"User-Agent": userAgent
		}
	});

	let pages = bodyResp.data.query.pages;
	let pageId = Object.keys(pages)[0];
	let body = pages[pageId].extract || "";

	return new Article(title, body);
}

router.get("/game", async (req, res) => {
	if (req.user) {
		req.user.number_of_plays += 1;
		await req.user.save();
	}
	return continueGame(req, res, true);
});

router.post("/guess", async (req, res) => {
	let button = req.body.button;
	let guess = 0;

	if (button === "higher") guess = 1;
	else if (button === "lower") guess = -1;

	if (guess === req.session.correct_answer || req.session.correct_answer === 0) {
		return continueGame(req, res, false);
	} else {
		if (req.user && req.user.high_score < req.session.score) {
			req.user.high_score = req.session.score;
			await req.user.save();
		}

		return res.render("game_over", {
            layout: "main",
            title: "Game Over",
			score: req.session.score,
			user: req.user
		});
	}
});

async function continueGame(req, res, start) {
	await new Promise(r => setTimeout(r, 1000));

	let article1, article2;

	if (start) {
		article1 = await getRandomArticle();
		article2 = await getRandomArticle();
		req.session.score = 0;
	} else {
		article1 = await getArticleByTitle(req.session.next_article_title);
		article2 = await getRandomArticle();
		req.session.score += 1;

		if (req.user) {
			req.user.total_points += 1;
			await req.user.save();
		}
	}

	req.session.next_article_title = article2.title;

	if (article1.word_count > article2.word_count)
		req.session.correct_answer = -1;
	else if (article1.word_count < article2.word_count)
		req.session.correct_answer = 1;
	else
		req.session.correct_answer = 0;

	res.render("game", {
		layout: "main",
        title: "Game",
		article1,
		article2,
		score: req.session.score,
		user: req.user
	});
}

router.get("/leaderboard", async (req, res) => {
	let users = await User.findAll({
		order: [["high_score", "DESC"]]
	});

	res.render("leaderboard", {
		layout: "main",
		title: "Leaderboard",
		users,
		user: req.user
	});
});

module.exports = router;
