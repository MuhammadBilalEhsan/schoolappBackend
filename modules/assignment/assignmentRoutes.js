const express = require("express");
const assignment = express.Router();
const assignmentController = require("./assignmentControllers");

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    },
});
var upload = multer({ storage: storage }).single("myFile");

assignment.post("/add", upload, assignmentController.addAssignmentController)
assignment.post("/submit", upload, assignmentController.submitAssignmentController)
assignment.route("/allassignments").post(assignmentController.getAllAssignments)
assignment.route("/submitted/:id").get(assignmentController.getSubmittedStudents)
assignment.route("/studentallchecked").post(assignmentController.allCheckedAssignmentsOfStudent)
assignment.route("/givemarks").post(assignmentController.giveMarksController)

module.exports = assignment;