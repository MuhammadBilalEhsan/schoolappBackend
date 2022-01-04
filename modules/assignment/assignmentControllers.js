const Assignment = require("../assignment/assignmentModel");
const admin = require("firebase-admin");
const fs = require("fs");

const bucket = admin.storage().bucket("gs://schoolapp-4ee60.appspot.com");

module.exports.addAssignmentController = async (req, res) => {
    try {
        const { title, courseID, desc } = req.body
        const createdAt = new Date().toString()
        if (!title || !courseID) {
            res.status(400).send({ error: "Invalid Request.." })
        } else {
            if (desc && !req.file) {
                const assignment = new Assignment({ title, courseID, description: desc, createdAt })
                const saveWithoutFile = await assignment.save()
                if (saveWithoutFile) {
                    const allAssignment = await Assignment.find({ courseID })
                    if (allAssignment) {
                        res.send({ message: "Assignment Added Successfully...", allAssignment })
                    }
                } else {
                    res.status(512).send({ error: "Unfourtunatly Assignment not saved ..." })
                }
            } else if (req.file && !desc) {
                bucket.upload(req.file.path,
                    function (err, file) {
                        if (!err) {
                            file.getSignedUrl({
                                action: 'read',
                                expires: '03-09-2491'
                            }).then(async (urlData, err) => {
                                try {
                                    if (!err) {
                                        const pubURL = urlData[0]

                                        const assignment = new Assignment({ title, courseID, createdAt, file: pubURL })
                                        const saveWithoutDescription = await assignment.save()
                                        fs.unlinkSync(req.file.path);
                                        if (saveWithoutDescription) {
                                            const allAssignment = await Assignment.find({ courseID })
                                            if (allAssignment) {
                                                res.send({ message: "Assignment Added Successfully...", allAssignment })
                                            }
                                        } else {
                                            res.status(512).send({ error: "Unfourtunatly Assignment not saved ..." })
                                        }
                                    }
                                } catch (error) {
                                    res.status(500).send({ error: "Unexpected Error.." })
                                }
                            })
                        }
                    }
                )
            } else if (req.file && desc) {
                bucket.upload(req.file.path,
                    function (err, file) {
                        if (!err) {
                            file.getSignedUrl({
                                action: 'read',
                                expires: '03-09-2491'
                            }).then(async (urlData, err) => {
                                try {
                                    if (!err) {
                                        const pubURL = urlData[0]

                                        const assignment = new Assignment({ title, courseID, description: desc, createdAt, file: pubURL })
                                        const saveWithBoth = await assignment.save()
                                        fs.unlinkSync(req.file.path);
                                        if (saveWithBoth) {
                                            const allAssignment = await Assignment.find({ courseID })
                                            if (allAssignment) {
                                                res.send({ message: "Assignment Added Successfully...", allAssignment })
                                            }
                                        } else {
                                            res.status(512).send({ error: "Unfourtunatly Assignment not saved ..." })
                                        }
                                    }
                                } catch (error) {
                                    res.status(500).send({ error: "Unexpected Error.." })
                                }
                            })
                        }
                    }
                )
            }
        }

    } catch (error) {
        res.status(500).send({ error: "Unexpected Error.." })
    }
}
module.exports.submitAssignmentController = async (req, res) => {
    try {
        const { assignmentID, id, name, time, desc } = req.body
        if (!assignmentID || !id || !name || !time) {
            res.status(400).send({ error: "Invalid Request.." })
        } else {
            const findAssignment = await Assignment.findById(assignmentID)
            if (findAssignment) {
                const checkSubmit = findAssignment.submitted?.find(student => student.id === id)
                if (!checkSubmit) {
                    if (desc && !req.file) {
                        const assignmentObj = { id, name, desc, sumitAt: time, marks: 0 }
                        const submitWithoutFile = await Assignment.findByIdAndUpdate(assignmentID, {
                            submitted: [...findAssignment.submitted, assignmentObj]
                        })
                        if (submitWithoutFile) {
                            const assignment = await Assignment.findById(assignmentID)
                            if (assignment) {
                                res.send({ message: "Assignment Submitted Successfully...", assignment })
                            }
                        } else {
                            res.status(512).send({ error: "Unfourtunatly Assignment not saved ..." })
                        }
                    } else if (req.file && !desc) {
                        bucket.upload(req.file.path,
                            function (err, file) {
                                if (!err) {
                                    file.getSignedUrl({
                                        action: 'read',
                                        expires: '03-09-2491'
                                    }).then(async (urlData, err) => {
                                        try {
                                            if (!err) {
                                                const pubURL = urlData[0]
                                                const assignmentObj = { id, name, file: pubURL, sumitAt: time, marks: 0 }

                                                const submitWithoutDesc = await Assignment.findByIdAndUpdate(assignmentID, {
                                                    submitted: [...findAssignment.submitted, assignmentObj]
                                                })
                                                fs.unlinkSync(req.file.path);
                                                if (submitWithoutDesc) {
                                                    const assignment = await Assignment.findById(assignmentID)
                                                    if (assignment) {
                                                        res.send({ message: "Assignment Submitted Successfully...", assignment })
                                                    }
                                                } else {
                                                    res.status(512).send({ error: "Unfourtunatly Assignment not saved ..." })
                                                }
                                            }
                                        } catch (error) {
                                            res.status(500).send({ error: "Unexpected Error.." })
                                        }
                                    })
                                }
                            }
                        )
                    } else if (req.file && desc) {
                        bucket.upload(req.file.path,
                            function (err, file) {
                                if (!err) {
                                    file.getSignedUrl({
                                        action: 'read',
                                        expires: '03-09-2491'
                                    }).then(async (urlData, err) => {
                                        try {
                                            if (!err) {
                                                const pubURL = urlData[0]

                                                const assignmentObj = { id, name, file: pubURL, desc, sumitAt: time, marks: 0 }
                                                const submitWithBoth = await Assignment.findByIdAndUpdate(assignmentID, {
                                                    submitted: [...findAssignment.submitted, assignmentObj]
                                                })
                                                fs.unlinkSync(req.file.path);
                                                if (submitWithBoth) {
                                                    const assignment = await Assignment.findById(assignmentID)
                                                    if (assignment) {
                                                        res.send({ message: "Assignment Submitted Successfully...", assignment })
                                                    }
                                                } else {
                                                    res.status(512).send({ error: "Unfourtunatly Assignment not saved ..." })
                                                }
                                            }
                                        } catch (error) {
                                            res.status(500).send({ error: "Unexpected Error.." })
                                        }
                                    })
                                }
                            }
                        )
                    }
                } else {
                    res.status(400).send({ error: "You have already submitted this assignment.." })
                }
            } else {
                res.status(404).send({ error: "Assignment not Found.." })

            }
        }

    } catch (error) {
        res.status(500).send({ error: "Unexpected Error.." })
    }

}
module.exports.getAllAssignments = async (req, res) => {
    try {
        const { courseID } = req.body
        if (!courseID) {
            res.status(400).send({ error: "Invalid Request" })
        } else {
            const getAllAssignments = await Assignment.find({ courseID })
            if (getAllAssignments) {
                res.send({ allAssignments: getAllAssignments })
            } else {
                res.status(404).send({ error: "No Assignment Found" })
            }
        }
    } catch (error) {
        res.status(500).send({ error: "Unexpected Error.." })
    }
}
module.exports.getSubmittedStudents = async (req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            res.status(400).send({ error: "Invalid Request..." })
        } else {
            const findAssignment = await Assignment.findById(id)
            if (findAssignment) {
                res.send({ assignment: findAssignment })
            } else {
                res.status(404).send({ error: "Assignment Not Found..." })
            }
        }
    } catch (error) {
        res.status(500).send({ error: "Unexpected Error.." })
    }
}
module.exports.giveMarksController = async (req, res) => {
    try {
        const { studentID, assignmentID, marks } = req.body
        if (!studentID || !assignmentID || !marks) {
            res.status(400).send({ error: "Invalid Request..." })
        } else {
            const findAssignment = await Assignment.findById(assignmentID)
            if (findAssignment) {
                const findSubmit = await findAssignment.submitted.find(student => student.id === studentID)
                findSubmit.marks = Math.round(marks)
                const filtered = await findAssignment.submitted.filter(student => student.id !== studentID)
                const updateSubmitted = await Assignment.findByIdAndUpdate(assignmentID, {
                    submitted: [...filtered, findSubmit]
                })
                if (updateSubmitted) {
                    const assignment = await Assignment.findById(assignmentID)
                    if (assignment) {
                        res.send({ message: "Marks Given...", assignment })
                    }
                } else {
                    res.status(505).send({ error: "Student Marks not Updating..." })
                }
            } else {
                res.status(404).send({ error: "Assignment Not Found..." })
            }
        }
    } catch (error) {
        res.status(500).send({ error: "Unexpected Error.." })
    }
}
module.exports.allCheckedAssignmentsOfStudent = async (req, res) => {
    try {
        const { courseID, studentID } = req.body
        if (!courseID || !studentID) {
            res.status(400).send({ error: "Invalid Request..." })
        } else {
            const findAllAssignments = await Assignment.find({ courseID })
            const filtered = findAllAssignments?.filter(assignment => {
                if (assignment.submitted.length) {
                    const findStudentInSubmitted = assignment.submitted?.find(student => student.id === studentID)
                    if (findStudentInSubmitted) {
                        const checkMarks = Number(findStudentInSubmitted.marks)
                        if (checkMarks) {
                            return assignment
                        }
                    }
                }
            })
            if (filtered) {
                res.send({ checked: filtered })
            } else {
                res.send({ checked: [] })
            }
        }
    } catch (error) {
        res.status(500).send({ error: "Unexpected Error.." })
    }
}