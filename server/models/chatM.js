const mongoose = require("mongoose");

const chat = new mongoose.Schema({
  chat_id: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  messages: [
    {
      sender_id: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", chat);

module.exports = Chat;
