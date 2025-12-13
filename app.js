const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session Config
app.use(
	session({
		secret: "techno_mendoza_secret_key", // In prod use env var
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }, // Set to true if using https
	})
);

// Routes
const mainRoutes = require("./routes/index");
const adminRoutes = require("./routes/admin");

app.use("/", mainRoutes);
app.use("/admin", adminRoutes);

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
