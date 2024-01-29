const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const chatSchema = new mongoose.Schema({
  chat_id: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
  },
  users_id: [{ type: String, required: true }],
});

const ChatModel =
  mongoose.model("Chat", chatSchema) || mongoose.model.chatSchema;

module.exports = ChatModel;
