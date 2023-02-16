import jwt from "jsonwebtoken";
import db from "./database.sdk.js";

const randomInt = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1) + min);

export async function authenticate(req, res, next) {
	var result = await verifyToken(req.cookies["token"]);

	if (result.success) {
		req.user = result.user;
		next();
	} else {
		if (result.clearToken) {
			res.clearCookie("token");
		}

		res.redirect("/login")
	}
}

export function verifyToken(token) {
	return new Promise((resolve) => {
		if (!token) { // Token cookie is not set
			resolve({
				success: false,
				reason: "Please sign in before continuing.",
				clearToken: false,
				user: null
			});
			return;
		}
	
		jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
			if (err) { // Token is not valid
				resolve({
					success: false,
					reason: "Your previous token does not work anymore.",
					clearToken: false,
					user: null
				});
				return;
			}
	
			// Check if token is stale ( not "good" )
			if (Date.now() - user.iat > 1000 * 60 * 60 * 24 * 14) {
				resolve({
					success: false,
					reason: "Your previous session has been timed out.",
					clearToken: true,
					user: null
				});
				return;
			}
			
			resolve({
				success: true,
				reason: null,
				clearToken: false,
				user: user
			});
		});
	});
}

function generateSnowflake() { // TODO: make more unique
	const hexChars = "0123456789abcdef";
	let id = "";
	for (var i = 0; i < 24; i++) {
		id += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
	}
	return id;
}

function generateColor(pastel = false) {
	let color = pastel ? [
		255, randomInt(162, 255), 162 // Pastel color
	] : [
		255, randomInt(36, 255), 36 // Solid color
	];

	for (let i = color.length - 1; i > 0; i--) { // Shuffle rgb color array
		let j = Math.floor(Math.random() * (i + 1));
		let temp = color[i];
		color[i] = color[j];
		color[j] = temp;
	}

	color = "#" + color.map(val => ("00" + val.toString(16)).slice(-2)).join(''); // Turn array into hex string
	
	return color;
}

function checkAccount(username, password) { // TODO: check for an account
	return false;
}

export function sessionToken(username, password = null) {
	let isGuest = password === null;

	if (isGuest) {
		let account = checkAccount(username, password);
	} else {

	}

	// Create token
	let user = {
		id: generateSnowflake(),
		username: username,
		guest: isGuest,
		password: password,
		color: generateColor(isGuest),
		discriminator: isGuest ? Math.floor(Math.random() * 100) : null,
		iat: Date.now()
	};
	let token = jwt.sign(user, process.env.TOKEN_SECRET);

	return token;
}
