const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const partiesPath = path.join(__dirname, "../data/parties.json");

// Helper to read parties
const getParties = () => {
	const data = fs.readFileSync(partiesPath);
	return JSON.parse(data);
};

// Home Page
router.get("/", (req, res) => {
	const parties = getParties();
	res.render("home", { parties });
});

// Party Details
router.get("/party/:id", (req, res) => {
	const parties = getParties();
	const party = parties.find((p) => p.id === req.params.id);
	if (!party) return res.status(404).send("Party not found");
	res.render("party", { party });
});

module.exports = router;
