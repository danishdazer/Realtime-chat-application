const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const MessageModel = require("../models/messageModel");
const ChatModel = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { senderId, content, chatId } = req.body;
    console.log(chatId);

    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const receiverId = chat.userIds.find((id) => id !== senderId);

    const newMessage = new MessageModel({
      content,
    });

    await newMessage.save();

    chat.messages.push(newMessage);
    await chat.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/messages/send", async (req, res) => {
  try {
    const { senderId, content, chatId } = req.body;

    // Check if the chat exists
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Determine the receiver ID based on the chat participants
    const receiverId = chat.userIds.find((id) => id !== senderId);

    // Create a new message using MessageModel
    const newMessage = new MessageModel({
      senderId,
      receiverId,
      content,
      chat: chatId, // Associate the message with the chat
    });

    // Save the message to the database
    await newMessage.save();

    // Add the message to the chat's messages array
    chat.messages.push(newMessage.content);
    await chat.save();

    // Respond with the newly created message
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { sendMessage };
