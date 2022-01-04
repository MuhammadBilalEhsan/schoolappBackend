const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
	teacher_id: {
		type: String,
		required: true,
	},
	teacherName: {
		type: String,
		required: true,
	},
	teacherClass: {
		type: String,
		required: true,
	},
	courseName: {
		type: String,
		required: true,
	},
	courseDesc: {
		type: String,
		required: true,
	},
	topics: {
		type: Array,
		required: true,
	},
	duration: {
		type: String,
		required: true,
	},
	courseOutline: {
		type: String,
		required: true,
	},

	dateOfCreation: {
		type: String,
		required: true,
	},

	students: [],
	chat: [],
	assignments: [],
	announcement: [],
});

const Course = mongoose.model("courses", courseSchema);

module.exports = Course;
