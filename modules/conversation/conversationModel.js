const mongoose = require("mongoose");

const ConversationSchema = mongoose.Schema({
    combinedID: {
        type: String,
        required: true,
    },
    user1ID: {
        type: String,
        required: true,
    },
    user1Name: {
        type: String,
        required: true,
    },
    user2ID: {
        type: String,
        required: true,
    },
    user2Name: {
        type: String,
        required: true,
    },
    chat: []
});


const Conversation = mongoose.model("conversations", ConversationSchema);

module.exports = Conversation;
