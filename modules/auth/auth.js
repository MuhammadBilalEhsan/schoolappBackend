const express = require("express");
const User = require("../user/userModel");
const auth = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

auth.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Please fill all fields properly.." });
        } else {
            const userExist = await User.findOne({ email }).exec();
            if (userExist) {
                const isMatch = await bcrypt.compare(password, userExist.password);
                if (!isMatch) {
                    return res.status(401).send({ error: "Invalid Credentials.." });
                } else {
                    const isBlocked = userExist.blocked
                    if (isBlocked) {
                        res.status(403).send({ error: "You Are Blocked, please contact with admin.." })
                    } else {
                        var token =
                            jwt.sign({
                                id: userExist._id,
                                fname: userExist.lname,
                                lname: userExist.lname,
                                email: userExist.email,
                                roll: userExist.roll,
                                atClass: userExist.atClass,
                            }, process.env.SECRET_KEY)

                        res.cookie('schoolCookie', token, {
                            maxAge: 8640000000000,
                            httpOnly: true,
                            secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
                        });

                        res.send({ user: userExist, message: "User Login successfully" });
                    }
                }
            } else {
                return res.status(404).json({ error: "Invalid Credentials.." });
            }
        }
    } catch (err) {
        res.status(500).send({ error: "Unexpected Error.." })
    }
})




module.exports = auth;