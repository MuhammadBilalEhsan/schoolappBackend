const express = require("express");
const course = express.Router();
const courseController = require("./courseController");

course.route("/add").post(courseController.addCourse);
course.route("/mycourse").post(courseController.getMyCourse);
course.route("/editcourse").post(courseController.editCourse);
course.route("/forstudent").post(courseController.coursesForStudents);
course.route("/getcourse").post(courseController.getOneCourse)
course.route("/applynow").post(courseController.applyForCourse);
course.route("/specific").post(courseController.getSpecificCourse);
course.route("/sendmessage").post(courseController.sendMessageController);
course.route("/delspecificstudent").post(courseController.delSpecificStudentByTeacher);
course.route("/announcement").post(courseController.addAnnouncementController);
course.route("/delcoursefromstudent").post(courseController.deleteCourseFromStudent);
course.route("/mutestudent").post(courseController.muteStudentController);


module.exports = course;
