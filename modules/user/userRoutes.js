const express = require("express");
const user = express.Router();
const userController = require("./userController");

const multer = require("multer");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/uploads");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "_" + file.originalname);
	},
});

var upload = multer({ storage: storage }).single("myImg");

user.route("/register").post(userController.registerUser);
user.route("/currentuser").get(userController.getCurrentUser);
user.route("/edit-profile").post(userController.EditProfile);
user.post("/editprofileimg", upload, userController.EditProfileImage);
user.route("/getdata").get(userController.getData);
user.route("/attendance").post(userController.markAttendance);
user.route("/sendmsg").post(userController.sendMessageController);
user.route("/myallconversations/:id").get(userController.myAllConversations);
user.route("/block/:id").get(userController.blockUserController);
user.route("/addclass").post(userController.addClass);
user.route("/changepassword").post(userController.changePassword);
user.route("/logout").get(userController.logOutController);

module.exports = user;
