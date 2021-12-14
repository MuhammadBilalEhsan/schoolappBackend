// const http = require("http");
const express = require("express");
const cors = require("cors");
// const socketIO = require("socket.io");
const path = require("path")
// const jwt = require('jsonwebtoken');
// const User = require("./modules/user/userModel")
// const bcrypt = require("bcryptjs");

const app = express();

const db = require("./database/conn");
const user = require("./modules/user/userRoutes");
const bodyParser = require("body-parser");

// const { initializeApp } = require("firebase/app");
// const firebaseConfig = require("./firebase/firebaseConfig");
const course = require("./modules/course/courseRoutes");
const assignment = require("./modules/assignment/assignmentRoutes");


require("dotenv").config();
const port = process.env.PORT || 4040;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




// app.use(express.static(path.join(__dirname, "frontend/build")))


// app.get("*", (req, res) => {
// 	res.sendFile(path.join(__dirname + "/frontend/build/index.html"))
// })
if (process.env.NODE_ENV == "production") {
	app.use(express.static("frontend/build"))
}
// initializeApp(firebaseConfig);
// app.use(express.static(__dirname + "./public/"));

app.use("/user", user);
app.use("/course", course);
app.use("/assignment", assignment);
// with this line of code we will get all the profile images

// setting for socket io

let server = app.listen(port, () => {
	console.log(`server is working on http://localhost:${port}`);
	db.dbConnector();
});


// server.listen(port, () => {
// 	console.log(`server is working on http://localhost:${port}`);
// 	db.dbConnector();
// });

// const server = http.createServer(app);
// const io = socketIO(server);

// io.on("connection", (socket) => {
// 	console.log("SocketIO New Connection");

// 	socket.on("disconnected", () => {
// 		console.log("User Left");
// 	});
// });


let socket = require('socket.io')(server);
socket.on('connection', (socket) => {
	// console.log('Client Connected ...!')

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
	// socket.on()

	socket.on("msgSentInStream", (course) => {
		socket.broadcast.emit("messageAddedStream", course)
	})
	socket.on("assignmentAdd", (allAssignment) => {
		socket.broadcast.emit("ASSIGNMENT_ADDED", allAssignment)
	})
})



// module.exports.io = io
