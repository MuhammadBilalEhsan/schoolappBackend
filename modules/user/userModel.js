const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema({
	fname: {
		type: String,
		required: true,
	},
	lname: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	roll: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	dateOfAddmission: {
		type: String,
		required: true,
	},

	fatherName: {
		type: String,
		required: false,
	},
	atClass: {
		type: String,
		required: true,
	},
	age: {
		type: Number,
		required: false,
	},
	phone: {
		type: Number,
		required: false,
	},
	dp: {
		type: String,
		required: false,
	},
	classes: [],
	attendance: [],
	courses: [],
	conversations: [],
	blocked: {
		type: Boolean,
		required: true,
	},
});

UserSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 12);
	}
	next();
});

const User = mongoose.model("users", UserSchema);

module.exports = User;
