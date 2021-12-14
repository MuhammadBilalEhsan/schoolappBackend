const express = require("express");
const cors = require("cors");
const path = require("path")

const app = express();

const db = require("./database/conn");
const user = require("./modules/user/userRoutes");
const bodyParser = require("body-parser");

const course = require("./modules/course/courseRoutes");
const assignment = require("./modules/assignment/assignmentRoutes");


require("dotenv").config();
const port = process.env.PORT || 4040;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static(__dirname + "./public/"));

app.use("/user", user);
app.use("/course", course);
app.use("/assignment", assignment);
let server = app.listen(port, () => {
	console.log(`server is working on http://localhost:${port}`);
	db.dbConnector();
});



let socket = require('socket.io')(server);
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

	socket.on("msgSentInStream", (course) => {
		socket.broadcast.emit("messageAddedStream", course)
	})
	socket.on("assignmentAdd", (allAssignment) => {
		socket.broadcast.emit("ASSIGNMENT_ADDED", allAssignment)
	})
})

