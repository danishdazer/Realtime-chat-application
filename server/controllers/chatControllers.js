const asyncHandler = require("express-async-handler");
const ChatModel = require("../models/chatModel"); // Make sure the correct model is imported
const MessageModel = require("../models/messageModel"); // Make sure the correct model is imported
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

app.use(cookieParser());

const extractUserIdMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (token && token.startsWith("Bearer ")) {
    const user_id = token.substring(7);
    req.user_id = user_id;
  }

  next();
};

// Use the middleware in your route handlers
app.use(extractUserIdMiddleware);

const accessChat = asyncHandler(async (req, res) => {
  try {
    const otherUserId = req.query.user;
    const currentUserId = req.query.loggeduserid;

    const existingChat = await ChatModel.findOne({
      userIds: { $all: [currentUserId, otherUserId] },
    });

    if (existingChat) {
      return res.status(200).json({ existingChat });
    } else {
      const newChat = new ChatModel({
        chatId: new mongoose.Types.ObjectId(),
        userIds: [currentUserId, otherUserId],
        messages: [],
      });

      await newChat.save();

      return res.status(200).json({ newChat });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const fetchAllMessages = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.query;

    const chat = await ChatModel.findOne({ chatId }).populate("messages");

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const messages = chat.messages;
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  accessChat,
  fetchAllMessages,
};
