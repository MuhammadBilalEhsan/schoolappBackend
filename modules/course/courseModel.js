const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
	teacher_id: {
		type: String,
		required: true,
	},
	teacherEmail: {
		type: String,
		required: true,
	},
	teacherClass: {
		type: Number,
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
		type: Number,
		required: true,
	},
	courseOutline: {
		type: Array,
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
