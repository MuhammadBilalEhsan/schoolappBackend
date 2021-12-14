const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
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
		required: false,
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
	attendance: [],
	courses: [],
	conversations: [],

	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
});

UserSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 12);
	}
	next();
});

UserSchema.methods.generateAuthToken = async function () {
	try {
		const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
		this.tokens = this.tokens.concat({ token: token });
		await this.save();
		return token;
	} catch (err) {
		console.log(err);
	}
};

const User = mongoose.model("users", UserSchema);

module.exports = User;
