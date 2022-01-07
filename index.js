const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
// const cookieParser = require('cookie-parser')
// const path = require('path')

const auth = require("./modules/auth/auth");
const db = require("./database/conn");
const user = require("./modules/user/userRoutes");
const bodyParser = require("body-parser");
// app.use(cookieParser());

const course = require("./modules/course/courseRoutes");
const assignment = require("./modules/assignment/assignmentRoutes");

require("dotenv").config();
const port = process.env.PORT || 4040;
app.use(
  cors({
    origin: ["http://localhost:3000", "https://school1.surge.sh"],
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use("*", express.static(path.resolve(path.join(__dirname, "./build"))));
app.use(express.static(__dirname + "./public/"));

app.use("/", auth);

app.use((req, res, next) => {
  if (req.headers.authentication) {
    jwt.verify(
      req.headers.authentication.split(" ")[1],
      process.env.SECRET_KEY,
      function (err, decoded) {
        if (!err) {
          next();
        } else {
          res.status(401).send({ error: "Unautherize.." });
        }
      }
    );
  } else {
    res.status(400).send({ error: "Unautherize Bad request.." });
  }
});

app.use("/user", user);
app.use("/course", course);
app.use("/assignment", assignment);
let server = app.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
  db.dbConnector();
});

let socket = require("socket.io")(server);
socket.on("connection", (socket) => {
  socket.on("newCoursesAdded", (newCourse) => {
    socket.broadcast.emit("courseADDEDByTeacher", newCourse);
  });

  socket.on("courseEditted", (course) => {
    socket.broadcast.emit("courseEditedByTeacher", course);
  });
  socket.on("changeInCourse", (course) => {
    socket.broadcast.emit("CHANGE_IN_COURSE", course);
  });
  socket.on("changeInAssignment", (assignment) => {
    socket.broadcast.emit("CHANGE_IN_ASSIGNMENT", assignment);
  });
  socket.on("changeInConversation", (conversation) => {
    socket.broadcast.emit("CHANGE_IN_CONVERSATION", conversation);
  });
  socket.on("msgSentInStream", (course) => {
    socket.broadcast.emit("messageAddedStream", course);
  });
  socket.on("assignmentAdd", (allAssignment) => {
    socket.broadcast.emit("ASSIGNMENT_ADDED", allAssignment);
  });
  socket.on("newUserAdded", (user) => {
    socket.broadcast.emit("NEW_USER_ADDED", user);
    socket.emit("NEW_USER_ADDED", user);
  });
  socket.on("changeInUser", (user) => {
    socket.broadcast.emit("CHANGE_IN_USER", user);
    socket.emit("CHANGE_IN_USER", user);
  });
});
