const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const partiesPath = path.join(__dirname, "../data/parties.json");

// Configure Multer for image uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/uploads/");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({ storage: storage });

// Helper to read/write parties
const getParties = () => {
	try {
		if (!fs.existsSync(partiesPath)) return [];
		const data = fs.readFileSync(partiesPath);
		return JSON.parse(data);
	} catch (e) {
		return [];
	}
};

const saveParties = (parties) => {
	fs.writeFileSync(partiesPath, JSON.stringify(parties, null, 2));
};

// Authentication Middleware
const isAdmin = (req, res, next) => {
	if (req.session.isAdmin) {
		return next();
	}
	res.redirect("/admin/login");
};

// Admin Login GET
router.get("/login", (req, res) => {
	res.render("admin/login", { error: null });
});

// Admin Login POST
router.post("/login", (req, res) => {
	const { username, password } = req.body;
	// Hardcoded credentials for simplicity as requested
	if (username === "admin" && password === "admin123") {
		req.session.isAdmin = true;
		res.redirect("/admin/dashboard");
	} else {
		res.render("admin/login", { error: "Invalid credentials" });
	}
});

// Dashboard
router.get("/dashboard", isAdmin, (req, res) => {
	const parties = getParties();
	res.render("admin/dashboard", { parties });
});

// Create Party
router.post("/create", isAdmin, upload.single("image"), (req, res) => {
	const parties = getParties();

	// Determine image source: uploaded file or URL
	let imageSource = "";
	if (req.file) {
		imageSource = "/uploads/" + req.file.filename;
	} else if (req.body.imageUrl && req.body.imageUrl.trim() !== "") {
		imageSource = req.body.imageUrl.trim();
	}

	const newParty = {
		id: uuidv4(),
		title: req.body.title,
		date: req.body.dateDisplay, // Display text
		startDateTime: req.body.startDateTime, // ISO datetime
		endDateTime: req.body.endDateTime, // ISO datetime
		location: req.body.location || "",
		description: req.body.description,
		image: imageSource,
		lineup: req.body.lineup,
		ticketLink: req.body.ticketLink,
		sponsors: req.body.sponsors,
		video: req.body.video, // Embed link
	};
	parties.push(newParty);
	saveParties(parties);
	res.redirect("/admin/dashboard");
});

// Edit Party - GET
router.get("/edit/:id", isAdmin, (req, res) => {
	const parties = getParties();
	const party = parties.find((p) => p.id === req.params.id);
	if (!party) return res.status(404).send("Party not found");
	res.render("admin/edit-party", { party });
});

// Update Party - POST
router.post("/update/:id", isAdmin, upload.single("image"), (req, res) => {
	let parties = getParties();
	const partyIndex = parties.findIndex((p) => p.id === req.params.id);

	if (partyIndex === -1) return res.status(404).send("Party not found");

	// Determine image source: keep existing, upload new file, or use URL
	let imageSource = parties[partyIndex].image; // Keep existing by default
	if (req.file) {
		imageSource = "/uploads/" + req.file.filename;
	} else if (req.body.imageUrl && req.body.imageUrl.trim() !== "") {
		imageSource = req.body.imageUrl.trim();
	}

	// Update party
	parties[partyIndex] = {
		id: req.params.id, // Keep the same ID
		title: req.body.title,
		date: req.body.dateDisplay,
		startDateTime: req.body.startDateTime || parties[partyIndex].startDateTime,
		endDateTime: req.body.endDateTime || parties[partyIndex].endDateTime,
		location: req.body.location || "",
		description: req.body.description,
		image: imageSource,
		lineup: req.body.lineup,
		ticketLink: req.body.ticketLink,
		sponsors: req.body.sponsors,
		video: req.body.video,
	};

	saveParties(parties);
	res.redirect("/admin/dashboard");
});

// Delete Party
router.post("/delete/:id", isAdmin, (req, res) => {
	let parties = getParties();
	parties = parties.filter((p) => p.id !== req.params.id);
	saveParties(parties);
	res.redirect("/admin/dashboard");
});

module.exports = router;
