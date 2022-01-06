const express = require("express");
const cors = require("cors")
const app = express();
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser')
// const path = require('path')


const auth = require("./modules/auth/auth")
const db = require("./database/conn");
const user = require("./modules/user/userRoutes");
const bodyParser = require("body-parser");
app.use(cookieParser());

const course = require("./modules/course/courseRoutes");
const assignment = require("./modules/assignment/assignmentRoutes");

require("dotenv").config();
const port = process.env.PORT || 4040;
app.use(cors({
	origin: true,
	// "Access-Control-Allow-Origin": '*',
	credentials: true,
}
));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// app.use("*", express.static(path.resolve(path.join(__dirname, "./build"))));
app.use(express.static(__dirname + "./public/"));

app.use("/", auth)


app.use((req, res, next) => {
	if (!req.cookies.schoolCookie) {
		res.status(401).send({ error: "include http-only credentials with every request" })
		return;
	}
	jwt.verify(req.cookies.schoolCookie, process.env.SECRET_KEY, function (err, decodedData) {
		if (!err) {
			const issueDate = decodedData.iat * 1000;
			const nowDate = new Date().getTime();
			const diff = nowDate - issueDate;
			if (diff > 900000) {
				res.status(401).send({ error: "token expired" })
			} else {
				const MAX_AGE_OF_TOKEN = 86400000
				var token = jwt.sign({
					id: decodedData.id,
					fname: decodedData.lname,
					lname: decodedData.lname,
					email: decodedData.email,
					roll: decodedData.roll,
					atClass: decodedData.atClass,
				}, process.env.SECRET_KEY)
				res.cookie('schoolCookie', token, {
					maxAge: MAX_AGE_OF_TOKEN,
					httpOnly: true
				});
				req.body.schoolCookie = decodedData
				req.headers.schoolCookie = decodedData
				next();
			}
		} else {
			res.status(401).send({ error: "invalid token" })
		}
	});
})


app.use("/user", user);
app.use("/course", course);
app.use("/assignment", assignment);
let server = app.listen(port, () => {
	console.log(`server is working on http://localhost:${port}`);
	db.dbConnector();
});

let socket = require('socket.io')(server, {
	cors: {
		origin: ['http://localhost:3000', 'https://warm-hollows-02372.herovkuapp.com', "https://school1.surge.sh"],
		methods: ["GET", "POST"],
		credentials: true
	}
});
socket.on('connection', (socket) => {

	socket.on('newCoursesAdded', (newCourse) => {
		socket.broadcast.emit("courseADDEDByTeacher", newCourse)
	})

	socket.on('courseEditted', (course) => {
		socket.broadcast.emit("courseEditedByTeacher", course)
	})
	socket.on('changeInCourse', (course) => {
		socket.broadcast.emit("CHANGE_IN_COURSE", course)
	})
	socket.on('changeInAssignment', (assignment) => {
		socket.broadcast.emit("CHANGE_IN_ASSIGNMENT", assignment)
	})
	socket.on('changeInConversation', (conversation) => {
		socket.broadcast.emit("CHANGE_IN_CONVERSATION", conversation)
	})
	socket.on("msgSentInStream", (course) => {
		socket.broadcast.emit("messageAddedStream", course)
	})
	socket.on("assignmentAdd", (allAssignment) => {
		socket.broadcast.emit("ASSIGNMENT_ADDED", allAssignment)
	})
	socket.on("newUserAdded", (user) => {
		socket.broadcast.emit("NEW_USER_ADDED", user)
		socket.emit("NEW_USER_ADDED", user)
	})
	socket.on("changeInUser", (user) => {
		socket.broadcast.emit("CHANGE_IN_USER", user)
		socket.emit("CHANGE_IN_USER", user)
	})
})