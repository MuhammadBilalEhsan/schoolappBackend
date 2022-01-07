const User = require("./userModel");
const Conversation = require("../conversation/conversationModel");
const bcrypt = require("bcryptjs");
const admin = require("firebase-admin");
const serviceAccount = require("../../firebase/serviceAccount");
const fs = require("fs");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://schoolapp-4ee60-default-rtdb.europe-west1.firebasedatabase.app/",
});
const bucket = admin.storage().bucket("gs://schoolapp-4ee60.appspot.com/");

module.exports.registerUser = async (req, res) => {
  try {
    let { fname, lname, email, password, roll, atClass } = req.body;
    let dateOfAddmission = new Date().toString();
    if (!fname || !lname || !email || !password || !roll || !atClass) {
      res.status(404).send({ error: "You Should fill all fields properly..!" });
    } else {
      const usertExist = await User.findOne({ email }).exec();
      if (!usertExist) {
        const user = new User({
          fname,
          lname,
          email,
          password,
          roll,
          atClass,
          dateOfAddmission,
          isAdmin: false,
          blocked: false,
        });
        const userSave = await user.save();
        if (userSave) {
          const user = await User.findOne({ email }).exec();
          if (user) {
            return res.send({
              message: "User Registered successfully",
              user,
            });
          }
        } else {
          return res.status(500).json({ error: "User can not registered." });
        }
      } else {
        return res.status(400).send({ error: "User already exists" });
      }
    }
  } catch (err) {
    res.status(500).send({ error: "Internal Server Error.." });
  }
};
module.exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send({ message: "user object sent..", user });
    } else {
      res.status(404).send({ error: "User not found.." });
    }
  } catch (error) {
    res.status(500).send({ error: "Unexpected Error.." });
  }
};
module.exports.EditProfile = async (req, res) => {
  try {
    let { id, fname, lname, fatherName, age, phone } = req.body;

    if (!fname || !lname || !fatherName || !age || !phone || !id) {
      return res.status(422).json({ error: "please fill all fields properly" });
    } else {
      const userUpdate = await User.findByIdAndUpdate(id, {
        fname,
        lname,
        fatherName,
        age,
        phone,
      });
      if (userUpdate) {
        const updated = await User.findById(id);
        res.status(200).send({ message: "User Update Successfully", updated });
      } else {
        res.status(400).send({ error: "User not Update" });
      }
    }
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error.." });
  }
};

module.exports.EditProfileImage = async (req, res) => {
  const _id = req.body._id;
  const dp = req.file;
  if (!_id || !dp) {
    res.status(400).send({ error: "Invalid Credentials!" });
  } else {
    bucket.upload(dp.path, function (err, file) {
      if (!err) {
        file
          .getSignedUrl({
            action: "read",
            expires: "03-09-2491",
          })
          .then(async (urlData, err) => {
            try {
              if (!err) {
                const pubURL = urlData[0];
                const pPic = await User.findByIdAndUpdate(_id, {
                  dp: pubURL,
                });
                if (pPic) {
                  res.send({
                    message: "Profile Picture updated.",
                    pPic: pubURL,
                  });
                  fs.unlinkSync(dp.path);
                } else {
                  res
                    .status(512)
                    .send({ error: "Profile Picture Not Updated" });
                }
              }
            } catch (error) {
              res.status(500).send({ error: "Internal Server Error.." });
            }
          });
      }
    });
  }
};

module.exports.markAttendance = async (req, res) => {
  try {
    const { _id, year, month, date, time } = req.body;
    if (!year || !month || !date || !time || !_id) {
      return res.status(400).send({ error: "Invalid Request" });
    } else {
      const findUser = await User.findOne({ _id });
      const mm_yy = `${
        month === "0"
          ? "jan"
          : month === "1"
          ? "feb"
          : month === "2"
          ? "mar"
          : month === "3"
          ? "apr"
          : month === "4"
          ? "may"
          : month === "5"
          ? "jun"
          : month === "6"
          ? "jul"
          : month === "7"
          ? "aug"
          : month === "8"
          ? "sep"
          : month === "9"
          ? "oct"
          : month === "10"
          ? "nov"
          : "dec"
      }_${year}`;
      if (!findUser) {
        return res.status(404).send({ error: "User not found" });
      } else {
        const getMonth = findUser.attendance.find(
          (cur) => cur.monthName === mm_yy
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
            (cur) => cur.monthName === mm_yy
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
        const updated = await User.findById(_id);
        if (updated) {
          return res
            .status(200)
            .send({ message: "Today's attendance have been marked.", updated });
        }
      }
    }
  } catch (err) {
    res.status(500).send({ error: "Internal Server Error.." });
  }
};

module.exports.getData = async (req, res) => {
  try {
    const users = await User.find({});
    if (users) {
      res.send({ users });
    }
  } catch (error) {
    res.status(500).send({ error: "Unexpected Error" });
  }
};

module.exports.sendMessageController = async (req, res) => {
  try {
    const {
      senderID,
      senderName,
      time,
      message,
      recieverID,
      _id,
      recieverName,
    } = req.body;
    if (!senderID || !time || !message || !recieverID) {
      res.status(400).send({ error: "Invalid Request" });
    } else {
      const combinedID1 = `${senderID}_${recieverID}`;
      const combinedID2 = `${recieverID}_${senderID}`;
      const newMessage = { senderID, message, time };
      if (_id) {
        const findConversation = await Conversation.findById(_id);
        if (findConversation) {
          const updateConversation = await Conversation.findByIdAndUpdate(_id, {
            chat: [...findConversation.chat, newMessage],
          });
          if (updateConversation) {
            const conversation = await Conversation.findById(_id);
            if (conversation) {
              res.send({ message: "Message sent", conversation });
            }
          } else {
            res.status(505).send({ error: "Message not sent.." });
          }
        }
      } else {
        const findWithcombinedID1 = await Conversation.findOne({
          combinedID: combinedID1,
        });
        if (findWithcombinedID1) {
          const updateConversation = await Conversation.findOneAndUpdate(
            combinedID1,
            {
              chat: [...findWithcombinedID1.chat, newMessage],
            }
          );
          if (updateConversation) {
            const conversation = await Conversation.findOne({
              combinedID: combinedID1,
            });
            if (conversation) {
              res.send({ message: "Message sent", conversation });
            } else {
              res.status(506).send({ error: "Message not sent.." });
            }
          }
        } else {
          const findWithcombinedID2 = await Conversation.findOne({
            combinedID: combinedID2,
          });
          if (findWithcombinedID2) {
            const updateConversation = await Conversation.findOneAndUpdate(
              combinedID2,
              {
                chat: [...findWithcombinedID2.chat, newMessage],
              }
            );
            if (updateConversation) {
              const conversation = await Conversation.findOne({
                combinedID: combinedID2,
              });
              if (conversation) {
                res.send({ message: "Message sent", conversation });
              } else {
                res.status(507).send({ error: "Message not sent.." });
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
              const conversation = await Conversation.findOne({
                combinedID: combinedID1,
              });
              if (conversation) {
                const sender = await User.findById(senderID);
                const reciever = await User.findById(recieverID);
                if (sender && reciever) {
                  const saveInSender = await User.findByIdAndUpdate(senderID, {
                    conversations: [...sender.conversations, conversation._id],
                  });
                  const saveInReciever = await User.findByIdAndUpdate(
                    recieverID,
                    {
                      conversations: [
                        ...reciever.conversations,
                        conversation._id,
                      ],
                    }
                  );
                  if (saveInSender && saveInReciever) {
                    res.send({ message: "Message sent", conversation });
                  } else {
                    res.status(508).send({ error: "Message not Sent" });
                  }
                }
              }
            } else {
              res.status(505).send({ error: "Message not Sent" });
            }
          }
        }
      }
    }
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error.." });
  }
};

module.exports.myAllConversations = async (req, res) => {
  try {
    const id = req.params.id;
    const allConversations = await Conversation.find({
      $or: [{ user1ID: id }, { user2ID: id }],
    });
    if (allConversations) {
      res.send({ allConversations });
    } else {
      res.send({ allConversations });
    }
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error.." });
  }
};

module.exports.blockUserController = async (req, res) => {
  try {
    const userID = req.params.id;
    if (!userID) {
      res.status(400).send({ error: "Invalid Credentials..." });
    } else {
      const findUser = await User.findById(userID);
      if (findUser) {
        if (findUser.blocked) {
          const updateUser = await User.findByIdAndUpdate(userID, {
            blocked: false,
          });
          // message = "User Unblocked..."
          if (updateUser) {
            const user = await User.findById(userID);
            if (user) {
              res.send({ user, message: "User Unblocked" });
            }
          } else {
            res.status(505).send({ error: "Unexpected Error" });
          }
        } else {
          const updateUser = await User.findByIdAndUpdate(userID, {
            blocked: true,
          });
          if (updateUser) {
            const user = await User.findById(userID);
            if (user) {
              res.send({ user, message: "User Blocked" });
            }
          } else {
            res.status(505).send({ error: "Unexpected Error" });
          }
        }
      } else {
        res.status(404).send({ error: "User Not Found..." });
      }
    }
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error.." });
  }
};
module.exports.addClass = async (req, res) => {
  try {
    const { title, adminID } = req.body;
    if (!title || !adminID) {
      res.status(400).send({ error: "Invalid Request.." });
    } else {
      const findAdmin = await User.findById(adminID);
      if (findAdmin.isAdmin) {
        var alreadyExist;
        if (findAdmin.classes?.length > 0) {
          let findClass = findAdmin.classes.find(
            (classTitle) => classTitle === title
          );
          if (findClass) {
            alreadyExist = true;
          } else {
            alreadyExist = false;
          }
        } else {
          alreadyExist = false;
        }
        if (alreadyExist) {
          res.status(400).send({ error: "Class already Exist.." });
        } else {
          const addClassInAdminObject = await User.findByIdAndUpdate(adminID, {
            classes: [...findAdmin.classes, String(title)],
          });
          if (addClassInAdminObject) {
            const user = await User.findById(adminID);
            if (user) {
              res.send({ message: "Class Added..", user });
            }
          } else {
            res.status(505).send({ error: "Unfortunatily Class not added.." });
          }
        }
      } else {
        res.status(404).send({ error: "Admin Not Found.." });
      }
    }
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error.." });
  }
};

module.exports.changePassword = async (req, res) => {
  try {
    const { id, oldPassword, newPassword, confirmPassword } = req.body;
    if (!id || !oldPassword || !newPassword || !confirmPassword) {
      res.status(400).send({ error: "Invalid Request.." });
    } else {
      const user = await User.findById(id);
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        res.status(400).send({ error: "Incorrect Old Password." });
      } else {
        if (newPassword !== confirmPassword) {
          res.status(400).send({ error: "Passwords not matching." });
        } else {
          const password = await bcrypt.hash(newPassword, 12);
          if (password) {
            const changePassword = await User.findByIdAndUpdate(id, {
              password: password,
            });
            if (changePassword) {
              res.send({ message: "Password Changed Successfully.." });
            }
          }
        }
      }
    }
  } catch (error) {
    res.status(500).send({ error: "Some Error in Change Password.." });
  }
};

// module.exports.logOutController = (req, res) => {
// 	res.clearCookie('schoolCookie')
// 	res.send({ message: "User logout" })
// }
