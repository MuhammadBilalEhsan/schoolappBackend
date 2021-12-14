const mongoose = require("mongoose");

const assignmentSchema = mongoose.Schema({
    courseID: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    file: {
        type: String,
        required: false
    },
    // Automatic fillable fields
    createdAt: {
        type: String,
        required: true
    },
    // Updateable Fields
    submitted: {
        type: Array,
        required: false
    },
});

const Assignment = mongoose.model("assignment", assignmentSchema);

module.exports = Assignment;
