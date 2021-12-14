const User = require("./userModel");
const Conversation = require("../conversation/conversationModel")
const bcrypt = require("bcryptjs");
const admin = require("firebase-admin");
const serviceAccount = require("../../firebase/serviceAccount")
const fs = require("fs")


admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https:schoolapp-4ee60-default-rtdb.europe-west1.firebasedatabase.app/"
});
const bucket = admin.storage().bucket("gs://schoolapp-4ee60.appspot.com/");
module.exports.registerUser = async (req, res) => {
	try {
		let { fname, lname, email, password, roll } = req.body;
		let dateOfAddmission = new Date().toString();
		if (!fname || !lname || !email || !password || !roll || !dateOfAddmission) {
			res
				.status(422)
				.json({ error: "You Should fill all fields properly..!" });
		}
		const usertExist = await User.findOne({ email }).exec();
		if (usertExist) {
			return res.status(422).json({ error: "User already exists" });
		} else {
			const user = new User({
				fname,
				lname,
				email,
				password,
				roll,
				dateOfAddmission,
			});

			const userSave = await user.save();
			if (userSave) {
				return res
					.status(200)
					.json({ message: "User Registered successfully" });
			} else {
				return res.status(500).json({ message: "User can not registered" });
			}
		}
	} catch (err) {
		console.log(err);
	}
};

module.exports.EditProfile = async (req, res) => {
	try {
		let { id, fname, lname, fatherName, atClass, age, phone } = req.body;

		if (!id || !fname || !lname || !fatherName || !atClass || !age || !phone) {
			return res.status(422).json({ error: "please fill all fields properly" });
		} else {
			const userUpdate = await User.findByIdAndUpdate(id, {
				fname,
				lname,
				fatherName,
				atClass,
				age,
				phone,
			});

			if (userUpdate) {
				const updated = await User.findById(id)
				res.status(200).send({ message: "User Update Successfully", updated });
			} else {
				res.status(400).send({ error: "User not Update" });
			}
		}
	} catch (error) {
		console.log(error);
	}
};

module.exports.EditProfileImage = async (req, res) => {
	const _id = req.body._id;
	const dp = req.file;
	if (!_id || !dp) {
		res.status(400).send({ error: "Invalid Credentials!" })
	}
	bucket.upload(dp.path,
		function (err, file) {
			if (!err) {
				file.getSignedUrl({
					action: 'read',
					expires: '03-09-2491'
				}).then(async (urlData, err) => {
					try {
						if (!err) {
							const pubURL = urlData[0]
							const pPic = await User.findByIdAndUpdate(_id, {
								dp: pubURL
							})
							fs.unlinkSync(dp.path)
							if (pPic) {
								res.send({ message: "Profile Picture will be updated in a few moments.", pPic: pubURL })
							} else {
								res.status(512).send({ error: "Profile Picture Not Updated" })
							}
						}
					} catch (error) {
						console.log(error)
					}
				})
			}
		}
	)
}

module.exports.loginUser = async (req, res) => {
	try {
		let token;
		let { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: "Please fill all fields properly" });
		} else {
			const userExist = await User.findOne({ email }).exec();
			if (userExist) {
				const isMatch = await bcrypt.compare(password, userExist.password);
				token = await userExist.generateAuthToken();
				res.cookie("jwtoken", token, {
					httpOnly: true,
				});
				if (!isMatch) {
					return res.status(401).json({ error: "Invalid Credentials" });
				} else {
					return res
						.status(200)
						.send({ curUser: userExist, message: "User Login successfully" });
				}
			} else {
				return res.status(401).json({ error: "User not exist" });
			}
		}
	} catch (err) {
		console.log(err);
	}
};

module.exports.markAttendance = async (req, res) => {
	try {
		const attObj = req.body;
		const { _id, year, month, date, time } = attObj;
		if (!_id || !year || !month || !date || !time) {
			return res.status(400).send({ error: "Invalid Request" });
		}
		const findUser = await User.findOne({ _id });
		const mm_yy = `${month}_${year}`;
		if (!findUser) {
			return res.status(404).send({ error: "User not found" });
		} else {
			const getMonth = findUser.attendance.find(
				(cur) => cur.monthName === mm_yy,
			);
			if (!getMonth) {
				const markAttWithNewMonth = await User.findByIdAndUpdate(_id, {
					attendance: [
						...findUser.attendance,
						{ monthName: mm_yy, days: [{ todayDate: date, time }] },
					],
				});
				if (!markAttWithNewMonth) {
					return res
						.status(500)
						.send({ error: "Mark Attendance with new Month failed!" });
				}
			} else {
				const getMonthIndexNo = findUser.attendance.findIndex(
					(cur) => cur.monthName === mm_yy,
				);
				const newAtt = [...findUser.attendance];
				newAtt[`${getMonthIndexNo}`].days.push({
					todayDate: date,
					time,
				});
				const markAttWithExistMonth = await User.findByIdAndUpdate(_id, {
					attendance: newAtt,
				});
				if (!markAttWithExistMonth) {
					return res
						.status(500)
						.send({ error: "Mark Attendance with Existing Month failed!" });
				}
			}
			const updated = await User.findById(_id)
			return res
				.status(200)
				.send({ message: "Todays attendance have been marked.", updated });
		}
	} catch (err) {
		console.error(err);
	}
};
module.exports.getData = async (req, res) => {
	const allUsers = await User.find({});
	res.status(200).send(allUsers);
};

module.exports.sendMessageController = async (req, res) => {
	try {
		const { senderID, senderName, time, message, recieverID, _id, recieverName } = req.body
		if (!senderID || !time || !message || !recieverID) {
			res.status(400).send({ error: "Invalid Request" })
		} else {
			const combinedID1 = `${senderID}_${recieverID}`
			const combinedID2 = `${recieverID}_${senderID}`
			const newMessage = { senderID, message, time }
			if (_id) {
				const findConversation = await Conversation.findById(_id)
				if (findConversation) {
					const updateConversation = await Conversation.findByIdAndUpdate(_id, {
						chat: [...findConversation.chat, newMessage]
					})
					if (updateConversation) {
						const conversation = await Conversation.findById(_id)
						if (conversation) {
							res.send({ message: "Message sent", conversation })
						}
					} else {
						res.status(505).send({ error: "Message not sent.." })
					}
				}
			} else {
				const findWithcombinedID1 = await Conversation.findOne({ combinedID: combinedID1 })
				if (findWithcombinedID1) {
					const updateConversation = await Conversation.findOneAndUpdate(combinedID1, {
						chat: [...findWithcombinedID1.chat, newMessage]
					})
					if (updateConversation) {
						const conversation = await Conversation.findOne({ combinedID: combinedID1 })
						if (conversation) {
							res.send({ message: "Message sent", conversation })
						} else {
							res.status(506).send({ error: "Message not sent.." })
						}
					}
				} else {
					const findWithcombinedID2 = await Conversation.findOne({ combinedID: combinedID2 })
					if (findWithcombinedID2) {
						const updateConversation = await Conversation.findOneAndUpdate(combinedID2, {
							chat: [...findWithcombinedID2.chat, newMessage]
						})
						if (updateConversation) {
							const conversation = await Conversation.findOne({ combinedID: combinedID2 })
							if (conversation) {
								res.send({ message: "Message sent", conversation })
							} else {
								res.status(507).send({ error: "Message not sent.." })
							}
						}
					} else {
						const newConversation = new Conversation({
							combinedID: combinedID1,
							user1ID: senderID,
							user1Name: senderName,
							user2ID: recieverID,
							user2Name: recieverName,
							chat: [newMessage],
						});
						const saveConversation = await newConversation.save();
						if (saveConversation) {
							const conversation = await Conversation.findOne({ combinedID: combinedID1 })
							if (conversation) {
								const sender = await User.findById(senderID)
								const reciever = await User.findById(recieverID)
								if (sender && reciever) {
									const saveInSender = await User.findByIdAndUpdate(senderID, {
										conversations: [...sender.conversations, conversation._id]
									})
									const saveInReciever = await User.findByIdAndUpdate(recieverID, {
										conversations: [...reciever.conversations, conversation._id]
									})
									if (saveInSender && saveInReciever) {
										res.send({ message: "Message sent", conversation })
									} else {
										res.status(508).send({ error: "Message not Sent" })
									}
								}
							}
						} else {
							res.status(505).send({ error: "Message not Sent" })
						}
					}
				}
			}
		}
	} catch (error) {
		console.log(error)
	}
}

module.exports.myAllConversations = async (req, res) => {
	try {
		const id = req.params.id
		const allConversations = await Conversation.find({ $or: [{ user1ID: id }, { user2ID: id }] })
		if (allConversations) {
			res.send({ allConversations })
		} else {
			res.send({ allConversations })
		}
	} catch (error) {
		res.status(450).send({ error })
	}
}
